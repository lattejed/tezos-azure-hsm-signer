
const assert = require('assert')
const {getPubKey} = require('../../controllers/get-pubkey')
const {tzKey, keys} = require('../data/all')
const {req, res, next} = require('../express-mock')

const _keys = () => { return keys }

describe('controllers/get-pubkey', () => {

  describe('getPubKey', () => {

    it('Should get public key', (done) => {

      let tz = tzKey.p256.pkh

      getPubKey(_keys)(req(tz), res((json) => {
        assert(json.public_key, 'No pubkey')
        done()
      }), next(done))
    })

  })

})
