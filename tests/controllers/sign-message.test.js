
const assert = require('assert')
const {signMessage} = require('../../controllers/sign-message')
const {testOps, testKeys} = require('../test-data')
const {req, res, next} = require('../express-mock')
const client = require('../client-mock')

describe('controllers/sign-message', () => {

  describe('signMessage', () => {

    it('Should sign a dummy block', (done) => {

      let hash = testKeys.P256.publicKeyTZH
      signMessage(testKeys, client, client)(req(hash, '01'), res((json) => {
        assert(json.signature === testKeys.P256.signedZeroHash, `Signature should be ${testKeys.P256.signedZeroHash}`)
        done()
      }), next())

    })

    it('Should sign a dummy endorsement', (done) => {

      let hash = testKeys.P256.publicKeyTZH
      signMessage(testKeys, client, client)(req(hash, '02'), res((json) => {
        assert(json.signature === testKeys.P256.signedZeroHash, `Signature should be ${testKeys.P256.signedZeroHash}`)
        done()
      }), next())

    })

    it('Should sign a dummy generic transaction', (done) => {

      let hash = testKeys.P256.publicKeyTZH
      signMessage(testKeys, client, client)(req(hash, '03'), res((json) => {
        assert(json.signature === testKeys.P256.signedZeroHash, `Signature should be ${testKeys.P256.signedZeroHash}`)
        done()
      }), next())

    })

  })

})
