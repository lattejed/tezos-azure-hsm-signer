
const assert = require('assert')
const {hsmKey, tzKey} = require('../data/all')
const {getPublicKeyFromXY} = require('../../models/public-key')

const PK = require('../../constants/pubkey-constants')

describe('models/public-keys', () => {

  describe('getPublicKeyFromXY', () => {

    describe('Curve P256', () => {

      let key = hsmKey.p256
      let {x, y, crv} = key.key

      it('Should create valid PK.UNCOMPRESSED', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.UNCOMPRESSED).toString('hex')
        let key2 = tzKey.p256.uncompressed
        assert(key1 === key2, `${key1} should equal ${key2}`)
      })

      it('Should create valid PK.COMPRESSED', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.COMPRESSED).toString('hex')
        let key2 = tzKey.p256.compressed
        assert(key1 === key2, `${key1} should equal ${key2}`)
      })

      it('Should create valid PK.TEZOS', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.TEZOS).toString('hex')
        let key2 = tzKey.p256.pk
        assert(key1 === key2, `${key1} should equal ${key2}`)
      })

      it('Should create valid PK.TEZOS_HASH', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.TEZOS_HASH).toString('hex')
        let key2 = tzKey.p256.pkh
        assert(key1 === key2, `${key1} should equal ${key2}`)
      })

    })

    describe('Curve P256K', () => {

      let key = hsmKey.p256k
      let {x, y, crv} = key.key

      it('Should create valid PK.UNCOMPRESSED', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.UNCOMPRESSED).toString('hex')
        let key2 = tzKey.p256k.uncompressed
        assert(key1 === key2, `${key1} should equal ${key2}`)
      })

      it('Should create valid PK.COMPRESSED', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.COMPRESSED).toString('hex')
        let key2 = tzKey.p256k.compressed
        assert(key1 === key2, `${key1} should equal ${key2}`)
      })

      it('Should create valid PK.TEZOS', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.TEZOS).toString('hex')
        let key2 = tzKey.p256k.pk
        assert(key1 === key2, `${key1} should equal ${key2}`)
      })

      it('Should create valid PK.TEZOS_HASH', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.TEZOS_HASH).toString('hex')
        let key2 = tzKey.p256k.pkh
        assert(key1 === key2, `${key1} should equal ${key2}`)
      })

    })

  })
  
})
