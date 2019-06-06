
const {createSignature} = require('../models/signature')
const TZ = require('../constants/tezos-constants')

const sign = function(key, op, signerFunc, res, next) {
  createSignature(key, op, signerFunc).then((sig) => {
    res.json({signature: sig})
  }).catch((error) => {
    next(error)
  })
}

const signMessage = function(keys, hsmClient, msgClient, vaultUri, watermark, magicBytes) {
  return function(req, res, next) {
    let tz = req.params.tzKeyHash
    let key = keys()[tz]
    if (!key) {
  		return next(new Error(`No public key found for ${tz}`))
  	}
    let op = req.body
    let magic = op.slice(0, 2)
    let signerFunc = hsmClient.signWithClient(vaultUri, key)
    if (magic === TZ.MAGIC_BLOCK || magic === TZ.MAGIC_ENDORSE) {
      sign(key, op, signerFunc, res, next)
    }
    else if (magic === TZ.MAGIC_GENERIC) {
      msgClient.serverListen((resp) => {
        if (resp === op) {
          sign(key, op, signerFunc, res, next)
        }
      })
      msgClient.serverSend(op)
    }
    else {
      return next(new Error(`Invalid magic bytes for op ${magic}`))
    }
  }
}

module.exports = {
  signMessage
}
