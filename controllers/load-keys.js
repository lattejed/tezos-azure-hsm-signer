
const {mapKeysFromHSMKeys} = require('../models/key-internal')

const loadKeys = function(hsmClient, vaultUri) {
  return hsmClient.loadKeysWithClient(vaultUri).then((hsmKeys) => {
    return Promise.resolve(mapKeysFromHSMKeys(hsmKeys))
  })
}

module.exports = {
  loadKeys
}
