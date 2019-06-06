
const {createSignature} = require('../models/signature')
const operation = require('../models/operation')
const {canSign, setWatermark} = require('../models/watermark')

const TZ = require('../constants/tezos-constants')

const signMessage = function(keys, hsmClient, msgClient, vaultUri, wmFile, watermark, magicBytes) {

  return function(req, res, next) {

    let tz = req.params.tzKeyHash
    let key = keys()[tz]
    if (!key) {
      return next(new Error(`No public key found for ${tz}`))
    }
    let op = req.body
    let wm = watermark && (operation.isBlock(op) || operation.isEndorsement(op))
    let signerFunc = hsmClient.signWithClient(vaultUri, key)
    let sign = function() {

      // Get signature from hsm

      createSignature(key, op, signerFunc).then((sig) => {

        // If we are watermarking, set and check before returning sig

        if (wm) {
          setWatermark(wmFile, tz, op)
          if (canSign(wmFile, tz, op)) {
            return next(new Error(`Failed to set watermark for ${op}. Not returning signature.`))
          }
        }
        res.json({signature: sig})
      }).catch((error) => {
        next(error)
      })
    }

    // check high watermark if necessary

    if (wm && !canSign(wmFile, tz, op)) {
      return next(new Error(`Watermark check failed for ${op}`))
    }

    // Check if we allow this op automatically

    if (operation.allowedOp(op, magicBytes)) {
      sign()
    }

    // Or request confirmation via client

    else {
      msgClient.serverListen((resp) => {
        if (resp === op) {
          sign()
        }
      })
      msgClient.serverSend(op)
    }

  }
}

module.exports = {
  signMessage
}
