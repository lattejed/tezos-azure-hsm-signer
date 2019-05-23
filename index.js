#!/usr/bin/env node

const assert = require('assert')
const express = require('express')
const http = require('http')
const msRestAzure = require('ms-rest-azure')
const KeyVault = require('azure-keyvault')
const PubKey = require('./secp256k1-utils.py')
const {
	unpackAzureKey,
	filterActiveAzureKeys
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

const app = express()

let cachedKeys = {}

// MARK: - HTTP

app.get('/authorized_keys', (req, res) => {
   res.json({})
})

app.get('/keys/:tz2PubKeyHash', (req, res) => {
	// TODO: Validations, error codes
	res.json({public_key: cachedKeys[req.params.tz2PubKeyHash]})
})

app.post('/keys/:tz2PubKeyHash', (req, res) => {
	// TODO: Validations
	let key = {}
	let payload = Buffer.from('0000', 'hex')
	sign(key, payload).then((signature) => {
		res.json({signature: signature})
	}).catch((error) => {
		//
	})
})

function startServer() {
	return new Promise((resolve, reject) => {
		let server = http.createServer(app)
		server.on('error', (error) => {
			reject(error)
		})
		server.on('connect', () => {
			resolve(`${APP_NAME} listening at http://${ADDRESS}:${PORT}`)
		})
		server.listen(PORT, ADDRESS)
	})
}

// MARK: - Azure

function authorize() {
  return msRestAzure.loginWithVmMSI({resource: AUTH_RESOURCE})
}

function loadKeysFromAzure(client) {
	return client.getKeys(vaultUri).then((keys) => {
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
		keys.forEach((key) => {
			//
		})
		return Promise.resolve()
	})
}

function sign(key, payload) {
	// TODO: Cache client?
	return authorize().then((credentials) => {
		let client = new KeyVault.KeyVaultClient(credentials)
		return client.sign(KEYVAULT_URI, key.name, key.version, SIGN_ALGO, payload)
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
		return startServer()
	})
}

initialize().then((serverMsg) => {
	console.log(serverMsg)
}).catch((error) => {
	console.log(error)
})
