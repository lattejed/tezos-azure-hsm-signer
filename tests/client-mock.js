
const loadKeysWithClient = function(vaultUri) {
  return Promise.resolve([]) // TODO:
}

const signWithClient = function(vaultUri, key, algo) {
  return function(key, algo, hash) {
    return Promise.resolve({result: Buffer.alloc(64).fill(0)})
  }
}

let serverCallback = null
let clientCallback = null

const serverSend = function(op) {
  serverCallback(op)
}

const serverListen = function(callback) {
  serverCallback = callback
}

const clientSend = function(op) {
  clientCallback(op)
}

const clientListen = function(callback) {
  clientCallback = callback
}

module.exports = {
  loadKeysWithClient,
  signWithClient,
  serverSend,
  serverListen,
  clientSend,
  clientListen
}
