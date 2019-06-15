
const {hsmKeys} = require('./data/all')

const loadKeysWithClient = function(vaultUri) {
  return Promise.resolve(hsmKeys)
}

const signWithClient = function(vaultUri, key, algo) {
  return function(key, algo, hash) {
    return Promise.resolve({result: Buffer.alloc(64).fill(0)})
  }
}

module.exports = {
  loadKeysWithClient,
  signWithClient
}
