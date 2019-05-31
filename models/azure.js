
const assert = require('assert')
const utils = require('./azure-utils')

const loadKeysFromAzureHSM = function(client, vaultUri) {
  assert(client && vaultUri, 'A valid client and vault uri are required')

  // Get all keys in vault

	return client.getKeys(vaultUri).then((keyObjs) => {

		let ps = keyObjs.map(function(keyObj) {
			let name = utils.getKeyName(keyObj)
			return client.getKeyVersions(vaultUri, name)
		});
		return Promise.all(ps)

  // Get active key version

	}).then((allKeyObjs) => {

		return Promise.resolve(utils.getActiveKeyVersion(allKeyObjs))

  // Get full keys

	}).then((activeKeyObjs) => {

		let ps = activeKeyObjs.map((keyObj) => {
			let name = utils.getKeyName(keyObj)
			let version = utils.getKeyVersion(keyObj)
			return client.getKey(vaultUri, name, version)
		})
		return Promise.all(ps)

  // Filter out invalid key types

	}).then((keyObjs) => {

    return Promise.resolve(utils.filterValidKeyTypes(keyObjs))
	})
}

const signWithAzureHSM = function(client, vaultUri, key, algo, msg) {
  assert(client && vaultUri, 'A valid client and vault uri are required')

  return function(key, algo, hash) {
    return client.sign(vaultUri, key.keyName, key.keyVersion, algo, hash)
  }
}

module.exports = {
  loadKeysFromAzureHSM,
  signWithAzureHSM
}
