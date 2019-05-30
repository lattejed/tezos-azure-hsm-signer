#!/usr/bin/env node

const assert = require('assert')
const express = require('express')
const http = require('http')
const msRestAzure = require('ms-rest-azure')
const KeyVault = require('azure-keyvault')
const AzureKey = require('./models/AzureKey')
const testData = require('./test-data')

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
const SIGN_ALGO = 'ES256K'

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
		res.json({public_key: pk.tzFormatPublicKey})
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
	var body = ''
	req.setEncoding('ascii') // TODO: Check this
	req.on('data', (chunk) => {
		body += chunk
	})
	req.on('end', () => {
		sign(key, payload).then((sig) => {
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

// MARK: - Azure

function authorize() {
  return msRestAzure.loginWithVmMSI({resource: AUTH_RESOURCE})
}

function loadKeysFromAzure() {
	if (!KEYVAULT_URI) {
		return Promise.reject('AZURE_KEYVAULT_URI environment variable must be set')
	}
	return authorize().then((credentials) => {
		let client = new KeyVault.KeyVaultClient(credentials)
		return client.getKeys(KEYVAULT_URI).then((keyObjs) => {
			let ps = keyObjs.map(function(keyObj) {
				let name = AzureKey.keyName(keyObj)
				return client.getKeyVersions(KEYVAULT_URI, name)
			});
			return Promise.all(ps)
		}).then((allKeyObjs) => {
			return Promise.resolve(AzureKey.filterActive(allKeyObjs))
		}).then((activeKeyObjs) => {
			let ps = activeKeyObjs.map((keyObj) => {
				let name = AzureKey.keyName(keyObj)
				let version = AzureKey.keyVersion(keyObj)
				return client.getKey(KEYVAULT_URI, name, version)
			})
			return Promise.all(ps)
		}).then((keyObjs) => {
	    return Promise.resolve(keyObjs.filterValid(allKeys))
		})
	})
}

function loadTestKeys() {
	return Promise.resolve(testData.azureKeyObjs)
}

function loadKeys() {
	return (TEST_MODE ? loadTestKeys() : loadKeysFromAzure()).then((keyObjs) => {
		keyObjs.forEach((keyObj) => {
			let key = new AzureKey(keyObj)
			let publicKeyHash = key.publicKey(AzureKey.PubKeyFormat.TEZOS_HASH)
			cachedKeys[publicKeyHash] = {
				name: key.keyName(),
				version: key.keyVersion(),
				publicKeyHash: publicKeyHash,
				publicKey: key.publicKey(AzureKey.PubKeyFormat.TEZOS)
			}
		})
	})
}

function sign(key, payload) {
	let hash = Key.hashForSignOperation(Buffer.from(payload, 'hex'))
	return (TEST_MODE ? signTest(key, hash) : signHSM(key, hash)).then((bsig) => {
		let hsig = bsig.result.toString('hex')
		let csig = Key.enforceSmallSForSig(hsig)
		let tzsig = Key.signatureInTzFormat(csig)
		return Promise.resolve(tzsig)
	})
}

function signHSM(key, hash) {
	return authorize().then((credentials) => {
		let client = new KeyVault.KeyVaultClient(credentials)
		return client.sign(KEYVAULT_URI, key.keyName(), key.keyVersion(), SIGN_ALGO, hash)
	})
}

function signTest(key, hash) {
	let sk = Buffer.from(key.privateKey, 'hex')
	let pk = Buffer.from(key.publicKey, 'hex')
	let keyObj = Key.fromKeypair(sk, pk)
	let sig = keyObj.sign(hash)
	assert(keyObj.verify(hash, sig), 'Sign test produced an invalid signature')
	return Promise.resolve({result: sig})
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
