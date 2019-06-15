
const assert = require('assert')
const fs = require('fs-extra')
const path = require('path')
const {signMessage} = require('../../controllers/sign-message')
const {op, tzKey, keys} = require('../data/all')
const {req, res, next} = require('../express-mock')
const hsmClient = require('../hsm-client-mock')

const TEST_DIR = path.join(__dirname, '..', 'tmp')

const _keys = () => { return keys }

let allMagic = ['0x01', '0x02']

describe('controllers/sign-message', () => {

  describe('signMessage', () => {

    describe('P256', () => {

      it('Should sign a dummy block', (done) => {

        let tz = tzKey.p256.pkh
        signMessage(_keys, hsmClient, null, null, TEST_DIR, true, allMagic)(req(tz, op.block), res((json) => {
          assert(json.signature, 'No signature')
          fs.removeSync(TEST_DIR)
          done()
        }), next(done))
      })

      it('Should sign a dummy endorsement', (done) => {

        let tz = tzKey.p256.pkh
        signMessage(_keys, hsmClient, null, null, TEST_DIR, true, allMagic)(req(tz, op.endorsement), res((json) => {
          assert(json.signature, 'No signature')
          fs.removeSync(TEST_DIR)
          done()
        }), next(done))
      })

      it('Should sign a dummy generic transaction', (done) => {

        let msgClient = require('../msg-client-mock')(true)

        let tz = tzKey.p256.pkh
        signMessage(_keys, hsmClient, msgClient, null, TEST_DIR, true, allMagic)(req(tz, op.generic), res((json) => {
          assert(json.signature, 'No signature')
          fs.removeSync(TEST_DIR)
          done()
        }), next(done))
      })

      it('Should fail to sign a dummy generic transaction', (done) => {

        let msgClient = require('../msg-client-mock')(false)

        let tz = tzKey.p256.pkh
        signMessage(_keys, hsmClient, msgClient, null, TEST_DIR, true, allMagic)(req(tz, op.generic), res((json) => {
          //
        }), (error) => {
          assert(/^Operation rejected by user/.test(error.message), 'Failed to throw error')
          fs.removeSync(TEST_DIR)
          done()
        })
      })

    })

  })

})
