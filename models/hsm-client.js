/**
 * Tezos Azure Signer HSM
 *
 * Copyright (c) Matthew Smith
 * All rights reserved.
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 * to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
 
const assert = require('assert')
const msRestAzure = require('ms-rest-azure')
const KeyVault = require('azure-keyvault')
const AZ = require('../constants/azure-constants')
const utils = require('../utils/azure-utils')

const getClient = function(vaultUri) {
  assert(vaultUri, 'A vault uri is required')

  let opts = {resource: AZ.AUTH_RESOURCE}
  return msRestAzure.loginWithVmMSI(opts).then((credentials) => {
    return Promise.resolve(new KeyVault.KeyVaultClient(credentials))
  })
}

const loadKeysWithClient = function(vaultUri) {

  return getClient(vaultUri).then((client) => {

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

  })

}

const signWithClient = function(vaultUri, key, algo) {
  return function(key, hash) {
    return getClient(vaultUri).then((client) => {
      let name = utils.getKeyName(key)
      let version = utils.getKeyVersion(key)
      let algo = key.signAlgo
      return client.sign(vaultUri, name, version, algo, hash)
    })
  }
}

module.exports = {
  loadKeysWithClient,
  signWithClient
}
