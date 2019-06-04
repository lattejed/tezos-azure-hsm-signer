
const {signWithClient} = require('../models/azure-client')
const {createSignature} = require('../models/signature')

const signMessage = function(keys, client, vaultUri, watermark, magicBytes) {
  return function(req, res, next) {
    let tz = req.params.tzKeyHash
    let key = keys[tz]
    if (!key) {
  		return next(new Error(`No public key found for ${tz}`))
  	}
    let signerFunc = client.signWithClient(vaultUri, key)
    createSignature(key, req.body, signerFunc).then((sig) => {
      res.json({signature: sig})
    }).catch((error) => {
  		next(error)
  	})
  }
}

module.exports = {
  signMessage
}
