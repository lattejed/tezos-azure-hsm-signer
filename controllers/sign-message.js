
const {getAuthorizedAzureClient} = require('../models/azure-client')
const {signWithAzureHSM} = require('../models/azure')
const {signMessage} = require('../models/signature')

const signMessage = function(key, vaultUri, watermark, magicBytes) {
  return function(req, res, next) {
    let tz = req.params.tzKeyHash
    let key = keys[tz]
    if (!key) {
  		return next(new Error(`No public key found for ${tz}`))
  	}

    let signerFunc = signWithAzureHSM(client, vaultUri, key, msg)

    getAuthorizedAzureClient(vaultUri).then((client) => {
      return signMessage(key, req.body, signerFunc).then(sig) => {
        res.json({signature: sig})
      })
    }).catch((error) => {
  		next(error)
  	})
  }
}

module.exports = {
  signMessage
}
