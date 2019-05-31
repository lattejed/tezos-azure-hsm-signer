
const assert = require('assert')
const msRestAzure = require('ms-rest-azure')
const KeyVault = require('azure-keyvault')
const AZ = require('../constants/azure-constants')

const getAuthorizedAzureClient = function(vaultUri) {
  assert(vaultUri, 'A vault uri is required')

  let opts = {resource: AZ.AUTH_RESOURCE}
  return msRestAzure.loginWithVmMSI(opts).then((credentials) => {
    return new KeyVault.KeyVaultClient(credentials)
  })
}

module.exports = {
  getAuthorizedAzureClient
}
