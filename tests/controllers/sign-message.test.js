
const assert = require('assert')
const {signMessage} = require('../../controllers/sign-message')
const client = require('../../models/dummy-client')

const keys = {
  "tz3QPpd8iER4ZUUTTDLjCbsNJhowrAVVz2Ys": {
    "keyName": "KeyVaultTest-SignerKeyP256",
    "keyVersion": "1d74b30f02d545759278192bd4ef42a7",
    "publicKeyHash": "tz3QPpd8iER4ZUUTTDLjCbsNJhowrAVVz2Ys",
    "publicKey": "p2pk66FrD7CenApRiHgnGtr86DEzXjjzqMbLvTVX757mZG8fArSRR5e",
    "signAlgo": "ES256"
  },
  "tz2GZguWayWgWFVaQAZMvbfTbeyruHWDDvR6": {
    "keyName": "KeyVaultTest-SignerKeyP256K",
    "keyVersion": "5469ae1a139240089866cb9b88c9024e",
    "publicKeyHash": "tz2GZguWayWgWFVaQAZMvbfTbeyruHWDDvR6",
    "publicKey": "sppk7aPRf3mXkUSxz3CWzH8SEBP2ASV1PbM3yb7WqvAbbZUqW7EokEu",
    "signAlgo": "ECDSA256"
  }
}

const validRequest = {
  params: {
    tzKeyHash: 'tz2GZguWayWgWFVaQAZMvbfTbeyruHWDDvR6'
  },
  body: '44444444'
}

const response = {
  json: function(obj) {
    return JSON.stringify(obj)
  }
}

const next = function(error) {
  throw error
}
/*
describe('sign-message', () => {
  describe('signMessage', () => {
    it('Should create a valid message signature', () => {


      let sig = signMessage(keys, client, null, null, null)(validRequest, response, next)
      console.log(sig)

    })
  })
})*/
