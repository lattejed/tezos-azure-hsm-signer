
const {getAuthorizedAzureClient} = require('../models/azure-client')
const {signWithAzureHSM} = require('../models/azure')
const {signMessage} = require('../models/signature')

// TODO: If we want the controller to be testable, we have to
// be able to inject the client and signer. The client could
// be set in the server, but signerFunc needs to be able to be
// set within the request / repsonse cycle.

// We could standardize client to have loadKeys and signMessage

const signMessage = function(vaultUri, watermark, magicBytes) {
  return function(req, res, next) {
    let tz = req.params.tzKeyHash
    let key = keys[tz]
    if (!key) {
  		return next(new Error(`No public key found for ${tz}`))
  	}

    // TODO: Maybe move client into azure?

    getAuthorizedAzureClient(vaultUri).then((client) => {

      let signerFunc = signWithAzureHSM(client, vaultUri, key, msg)

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
