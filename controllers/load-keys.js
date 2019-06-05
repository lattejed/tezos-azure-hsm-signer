
const loadKeys = function(hsmClient, vaultUri) {
  return hsmClient.loadKeysWithClient(vaultUri)
}

module.exports = {
  loadKeys
}
