
const assert = require('assert')
const {signMessage} = require('../../controllers/sign-message')
const {op, tzKey, keys} = require('../data/all')
const {req, res, next} = require('../express-mock')
const client = require('../client-mock')

const _keys = () => { return keys }

describe('controllers/sign-message', () => {

  describe('signMessage', () => {

    describe('P256', () => {

      it('Should sign a dummy block', (done) => {

        let tz = tzKey.p256.pkh
        signMessage(_keys, client, client)(req(tz, op.block), res((json) => {
          assert(json.signature, 'No signature')
          done()
        }), next(done))
      })

      it('Should sign a dummy endorsement', (done) => {

        let tz = tzKey.p256.pkh
        signMessage(_keys, client, client)(req(tz, op.endorsement), res((json) => {
          assert(json.signature, 'No signature')
          done()
        }), next())
      })

      it('Should sign a dummy generic transaction', (done) => {

        let tz = tzKey.p256.pkh
        signMessage(_keys, client, client)(req(tz, op.generic), res((json) => {
          assert(json.signature, 'No signature')
          done()
        }), next())
      })

    })

    describe('P256K', () => {

      it('Should sign a dummy block', (done) => {

        let tz = tzKey.p256k.pkh
        signMessage(_keys, client, client)(req(tz, op.block), res((json) => {
          assert(json.signature, 'No signature')
          done()
        }), next(done))
      })

      it('Should sign a dummy endorsement', (done) => {

        let tz = tzKey.p256k.pkh
        signMessage(_keys, client, client)(req(tz, op.endorsement), res((json) => {
          assert(json.signature, 'No signature')
          done()
        }), next())
      })

      it('Should sign a dummy generic transaction', (done) => {

        let tz = tzKey.p256k.pkh
        signMessage(_keys, client, client)(req(tz, op.generic), res((json) => {
          assert(json.signature, 'No signature')
          done()
        }), next())
      })

    })


  })

})
