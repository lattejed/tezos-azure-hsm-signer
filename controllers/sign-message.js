
const {createSignature} = require('../models/signature')
const operation = require('../models/operation')

const TZ = require('../constants/tezos-constants')

const sign = function(key, op, signerFunc, res, next) {
  createSignature(key, op, signerFunc).then((sig) => {
    res.json({signature: sig})
  }).catch((error) => {
    next(error)
  })
}

const signMessage = function(keys, hsmClient, msgClient, vaultUri, wmFile, watermark, magicBytes) {
  return function(req, res, next) {
    let tz = req.params.tzKeyHash
    let key = keys()[tz]
    if (!key) {
  		return next(new Error(`No public key found for ${tz}`))
  	}
    let op = req.body
    let signerFunc = hsmClient.signWithClient(vaultUri, key)

    // check high watermark if necessary

    if (watermark && (operation.isBlock(op) || operation.isEndorsement(op))) {
      //return next(new Error(`Watermark check failed for ${op}`))
    }

    // Check if we allow this op automatically

    if (operation.allowedOp(op, magicBytes)) {
      sign(key, op, signerFunc, res, next)
    }

    // Or request confirmation via client

    else {
      msgClient.serverListen((resp) => {
        if (resp === op) {
          sign(key, op, signerFunc, res, next)
        }
      })
      msgClient.serverSend(op)
    }

  }
}

module.exports = {
  signMessage
}
