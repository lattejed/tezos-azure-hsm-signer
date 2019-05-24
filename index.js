#!/usr/bin/env node

const assert = require('assert')
const express = require('express')
const http = require('http')
const msRestAzure = require('ms-rest-azure')
const KeyVault = require('azure-keyvault')
const PubKey = require('./secp256k1-utils').PubKeySecp256k1
const {
	unpackAzureKey,
	filterActiveAzureKeys,
	filterAzureKeysByType
} = require('./utils')

const argv = require('yargs')
	.usage('Usage: $0 [options]')
	.alias('M', 'magic-bytes')
	.alias('W', 'check-high-watermark')
	.alias('a', 'address')
	.alias('p', 'port')
	.boolean(['check-high-watermark'])
	.default({M: '*', W: true, a: '127.0.0.1', p: 6732})
	.help('h')
  .alias('h', 'help')
	.argv

const KEYVAULT_URI = process.env.AZURE_KEYVAULT_URI
const ADDRESS = argv.address
const PORT = argv.port
const CHECK_HIGH_WATERMARK = argv.checkHighWatermark
const MAGIC_BYTES = argv.magicBytes

const AUTH_RESOURCE = 'https://vault.azure.net'
const APP_NAME = 'Tezos Azure Signer'
const SIGN_ALGO = 'ES256K'
const VALID_KEY_CRV = 'P-256K'
const VALID_KEY_KTY = 'EC-HSM'

const app = express()

let cachedKeys = {}

// MARK: - HTTP

app.get('/authorized_keys', (req, res) => {
   res.json({})
})

app.get('/keys/:tz2PubKeyHash', (req, res, next) => {
	let tz2 = req.params.tz2PubKeyHash
	let sppk = (cachedKeys[tz2] || {}).sppk
	if (sppk) {
		res.json({public_key: sppk})
	} else {
		next(new Error(`No public key found for ${tz2}`))
	}
})

app.post('/keys/:tz2PubKeyHash', (req, res, next) => {
	let tz2 = req.params.tz2PubKeyHash
	let key = cachedKeys[tz2]
	if (!key) {
		return next(new Error(`No public key found for ${tz2}`))
	}
	var body = ''
	req.setEncoding('ascii') // TODO: Check this
	req.on('data', (chunk) => {
		body += chunk
	})
	req.on('end', () => {
		let payload = body.replace(/^0x/, '')
		sign(key, payload).then((tzsig) => {
			res.json({signature: tzsig})
		}).catch((error) => {
			next(error)
		})
	})
})

app.use(function (err, req, res, next) {
  console.error(err.message)
  res.status(500).send(`Error: ${err.message}`)
})

function startServer() {
	return new Promise((resolve, reject) => {
		let server = http.createServer(app)
		server.on('error', (error) => {
			reject(error)
		})
		server.on('listening', () => {
			console.info(`${APP_NAME} listening at http://${ADDRESS}:${PORT}`)
			resolve()
		})
		server.listen(PORT, ADDRESS)
	})
}

// MARK: - Azure

function authorize() {
  return msRestAzure.loginWithVmMSI({resource: AUTH_RESOURCE})
}

function loadKeysFromAzure(client) {
	return client.getKeys(KEYVAULT_URI).then((keys) => {
		let ps = keys.map(function(key) {
			let name = unpackAzureKey(key).name
			return client.getKeyVersions(KEYVAULT_URI, name)
		});
		return Promise.all(ps)
	}).then((allKeys) => {
		return Promise.resolve(filterActiveAzureKeys(allKeys))
	}).then((activeKeys) => {
		let ps = activeKeys.map((key) => {
			let unpacked = unpackAzureKey(key)
			return client.getKey(KEYVAULT_URI, unpacked.name, unpacked.version)
		})
		return Promise.all(ps)
	}).then((keys) => {
		let allKeys = keys.map((key) => { return key.key })
    let validKeys = filterAzureKeysByType(allKeys, VALID_KEY_CRV, VALID_KEY_KTY)
    validKeys.forEach((key) => {
			let unpacked = unpackAzureKey(key)
			let pubKey = new PubKey(key.x, key.y)
			let tz2 = pubKey.publicKeyHashTz2Format()
			cachedKeys[tz2] = {
				name: unpacked.name,
				version: unpacked.version,
				tz2: tz2,
				sppk: pubKey.publicKeySPPKFormat()
			}
		})
    return Promise.resolve()
	})
}

function sign(key, payload) {
	let hash = PubKey.hashForSignOperation(Buffer.from(payload, 'hex'))
	return authorize().then((credentials) => {
		let client = new KeyVault.KeyVaultClient(credentials)
		return client.sign(KEYVAULT_URI, key.name, key.version, SIGN_ALGO, payload)
	}).then((azsig) => {
		let hsig = azsig.result.toString('hex')
		let csig = PubKey.enforceSmallSForSig(hsig)
		let tzsig = PubKey.signatureInTzFormat(csig)
		return Promise.resolve(tzsig)
	})
}

// MARK: - Startup

function initialize() {
	if (!KEYVAULT_URI) {
		return Promise.reject('AZURE_KEYVAULT_URI environment variable must be set')
	}
	return authorize().then((credentials) => {
	  let client = new KeyVault.KeyVaultClient(credentials)
		return loadKeysFromAzure(client)
	}).then(() => {
		console.info(`Loaded Public Keys:\n${JSON.stringify(cachedKeys, null, 2)}`)
		return startServer()
	})
}

initialize().then(() => {
  console.info('Initalization finished')
}).catch((error) => {
  console.error(error)
})
