
const {getKeyFromHSMKey} = require('../models/key-internal')

const loadKeys = function(hsmClient, vaultUri) {
  return hsmClient.loadKeysWithClient(vaultUri).then((hsmKeys) => {
    return Promise.resolve(hsmKeys.map(getKeyFromHSMKey))
  })
}

module.exports = {
  loadKeys
}
