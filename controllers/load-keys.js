
const {getAuthorizedAzureClient} = require('../models/azure-client')

const loadKeys = function(vaultUri) {
  return Promise.resolve([])
}

module.exports = {
  loadKeys
}
