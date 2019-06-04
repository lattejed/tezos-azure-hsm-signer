
const loadKeysWithClient = function(vaultUri) {
  return Promise.resolve([]) // TODO:
}

const signWithClient = function(vaultUri, key, algo, msg) {
  
  return function(key, algo, hash) {
    return Promise.resolve({result: ''}) // TODO:
  }
}

module.exports = {
  loadKeysWithClient,
  signWithClient
}
