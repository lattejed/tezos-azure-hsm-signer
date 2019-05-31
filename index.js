#!/usr/bin/env node

const assert = require('assert')
const express = require('express')
const http = require('http')
const msRestAzure = require('ms-rest-azure')
const KeyVault = require('azure-keyvault')
const AzureKey = require('./models/AzureKey')
const TezosSig = require('./models/TezosSig')

const argv = require('yargs')
	.usage('Usage: $0 [options]')
	.alias('M', 'magic-bytes')
	.alias('W', 'check-high-watermark')
	.alias('a', 'address')
	.alias('p', 'port')
	.boolean(['check-high-watermark', 'test-mode'])
	.default({M: '*', W: true, a: '127.0.0.1', p: 6732, testMode: false})
	.help('h')
  .alias('h', 'help')
	.argv

const KEYVAULT_URI = process.env.AZURE_KEYVAULT_URI
const ADDRESS = argv.address
const PORT = argv.port
const CHECK_HIGH_WATERMARK = argv.checkHighWatermark
const MAGIC_BYTES = argv.magicBytes
const TEST_MODE = argv.testMode

const AUTH_RESOURCE = 'https://vault.azure.net'
const APP_NAME = 'Tezos Azure Signer'

const app = express()

let cachedKeys = {}

// MARK: - HTTP

app.get('/authorized_keys', (req, res) => {
   res.json({})
})

app.get('/keys/:tzKeyHash', (req, res, next) => {
	let tz = req.params.tzKeyHash
	let pk = cachedKeys[tz]
	if (pk) {
		res.json({public_key: pk.publicKey})
	} else {
		next(new Error(`No public key found for ${tz}`))
	}
})

app.post('/keys/:tzKeyHash', (req, res, next) => {
	let tz = req.params.tzKeyHash
	let key = cachedKeys[tz]
	if (!key) {
		return next(new Error(`No public key found for ${tz}`))
	}
	var msg = ''
	req.setEncoding('ascii')
	req.on('data', (chunk) => {
		msg += chunk
	})
	req.on('end', () => {
		sign(key, msg).then((sig) => {
			res.json({signature: sig})
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

// MARK: - Sign

function sign(key, msg) {
	let sig = TezosSig(key, msg)
	let hash = sig.hashedMessage()
	return (TEST_MODE ? signTest(key, hash) : signHSM(key, hash)).then((raw) => {
		return Promise.resolve(sig.signatureFromRaw(raw))
	})
}

// TODO: Move this into model
function signHSM(key, hash) {
	return authorize().then((credentials) => {
		let client = new KeyVault.KeyVaultClient(credentials)
		return client.sign(KEYVAULT_URI, key.keyName, key.keyVersion, SIGN_ALGO, hash)
	})
}

function signTest(key, hash) {
	let raw = ''
	return Promise.resolve({result: raw})
}

// MARK: - Keys

function loadKeysFromAzure() {
	if (!KEYVAULT_URI) {
		return Promise.reject('AZURE_KEYVAULT_URI environment variable must be set')
	}
	return authorize().then((credentials) => {
		let client = new KeyVault.KeyVaultClient(credentials)
		return AzureKey.loadRemote(client, KEYVAULT_URI)
	})
}

function loadTestKeys() {
	return AzureKey.loadTest()
}

function loadKeys() {
	return (TEST_MODE ? loadTestKeys() : loadKeysFromAzure()).then((keyObjs) => {
		keyObjs.forEach((keyObj) => {
			let key = new AzureKey(keyObj)
			let publicKeyHash = key.publicKey(AzureKey.PubKeyFormat.TEZOS_HASH)
			cachedKeys[publicKeyHash] = {
				keyName: key.keyName(),
				keyVersion: key.keyVersion(),
				publicKeyHash: publicKeyHash,
				publicKey: key.publicKey(AzureKey.PubKeyFormat.TEZOS)
			}
		})
	})
}

// MARK: - Auth

function authorize() {
  return msRestAzure.loginWithVmMSI({resource: AUTH_RESOURCE})
}

// MARK: - Startup

function initialize() {
	return loadKeys().then(() => {
		console.info(`Loaded Keys:\n${JSON.stringify(cachedKeys, null, 2)}`)
		return startServer()
	})
}

initialize().then(() => {
	if (TEST_MODE) {
		console.warn('WARNING: Running in TEST MODE')
	}
	console.info('Initalization finished')
}).catch((error) => {
  console.error(error)
	process.exit(1)
})
