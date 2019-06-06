
const assert = require('assert')
const {tzKey, keys} = require('../data/all')
const {createSignature} = require('../../models/signature')
const K = require('../../constants/secp256k1-constants')

describe('models/signature', () => {

  describe('createSignature', () => {

    describe('Curve P256', () => {

      it('Should sign zeros', (done) => {

        let tz = tzKey.p256.pkh
        let key = keys[tz]

        let sig = 'p2sigMJWuMaj1zAfVMzdZzFnoncCKE7faHzJ7coB6h3ziUiGeZoTZUNfYSQR5t2dJ6cFWCvUx8CZdLRCigAUtrt2JEfRzvbDnL'

        createSignature(key, '', () => {
          return Promise.resolve({result: Buffer.alloc(64).fill(0)})
        }).then((res) => {
          assert(sig === res, 'Invalid signature')
          done()
        }).catch(done)

      })

    })

    describe('Curve P256K', () => {

      it('Should sign zeros', (done) => {

        let tz = tzKey.p256k.pkh
        let key = keys[tz]

        let sig = 'spsig15oyPL6RPsCmQbjdHRDQgBpnqfF1PGCaNk9eV5ksEABhY6BVRfPxGHhrV4fC84UYGJe7g1pFiyccSaBfg97KnBWCXYZh9c'

        createSignature(key, '', () => {
          return Promise.resolve({result: Buffer.alloc(64).fill(0)})
        }).then((res) => {
          assert(sig === res, 'Invalid signature')
          done()
        }).catch(done)

      })

      it('Should sign low S value', (done) => {

        let tz = tzKey.p256k.pkh
        let key = keys[tz]

        let sig = 'spsig15oyPL6RPsCmQbjdHRDQgBpnqfF1PGCaNk9eV5ksEABhZ4Z5YPQsydKRPrWeQsUWvbzJo9Dp4mfGuUkAKdPyTg1ZVpkutR'
        let lowSRawSig = Buffer.concat([
          Buffer.alloc(32).fill(0),
          Buffer.from((BigInt(K.CURVE_HALF_ORDER) - BigInt(1)).toString(16), 'hex')
        ])

        createSignature(key, '', () => {
          return Promise.resolve({result: lowSRawSig})
        }).then((res) => {
          assert(sig === res, 'Invalid signature')
          done()
        }).catch(done)

      })

      it('Should sign high S value', (done) => {

        let tz = tzKey.p256k.pkh
        let key = keys[tz]

        let sig = 'spsig15oyPL6RPsCmQbjdHRDQgBpnqfF1PGCaNk9eV5ksEABhZ4Z5YPQsydKRPrWeQsUWvbzJo9Dp4mfGuUkAKdPyTg1ZbVu75W'
        let highSRawSig = Buffer.concat([
          Buffer.alloc(32).fill(0),
          Buffer.from((BigInt(K.CURVE_HALF_ORDER) + BigInt(1)).toString(16), 'hex')
        ])

        createSignature(key, '', () => {
          return Promise.resolve({result: highSRawSig})
        }).then((res) => {
          assert(sig === res, 'Invalid signature')
          done()
        }).catch(done)

      })

    })

  })

})
