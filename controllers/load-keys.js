
const {getAuthorizedAzureClient} = require('../models/hsm-client')

const loadKeys = function(hsmClient, vaultUri) {
  return hsmClient.loadKeysWithClient(vaultUri)
}

module.exports = {
  loadKeys
}
