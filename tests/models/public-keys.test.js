
const assert = require('assert')
const {testKeys} = require('../test-data')
const {getPublicKeyFromXY} = require('../../models/public-key')
const PK = require('../../constants/pubkey-constants')

describe('public-keys', () => {

  describe('getPublicKeyFromXY', () => {

    describe('Curve P256', () => {

      let key = testKeys.P256
      let {x, y, crv} = key.key

      it('Should create valid PK.UNCOMPRESSED', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.UNCOMPRESSED).toString('hex')
        let key2 = key.publicKeyU
        assert(key1 === key2, `${key1} should equal ${key2}`)

      })

      it('Should create valid PK.COMPRESSED', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.COMPRESSED).toString('hex')
        let key2 = key.publicKeyC
        assert(key1 === key2, `${key1} should equal ${key2}`)

      })

      it('Should create valid PK.TEZOS', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.TEZOS).toString('hex')
        let key2 = key.publicKeyTZ
        assert(key1 === key2, `${key1} should equal ${key2}`)

      })

      it('Should create valid PK.TEZOS_HASH', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.TEZOS_HASH).toString('hex')
        let key2 = key.publicKeyTZH
        assert(key1 === key2, `${key1} should equal ${key2}`)

      })

    })

    describe('Curve P256K', () => {

      let key = testKeys.P256K
      let {x, y, crv} = key.key

      it('Should create valid PK.UNCOMPRESSED', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.UNCOMPRESSED).toString('hex')
        let key2 = key.publicKeyU
        assert(key1 === key2, `${key1} should equal ${key2}`)

      })

      it('Should create valid PK.COMPRESSED', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.COMPRESSED).toString('hex')
        let key2 = key.publicKeyC
        assert(key1 === key2, `${key1} should equal ${key2}`)

      })

      it('Should create valid PK.TEZOS', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.TEZOS).toString('hex')
        let key2 = key.publicKeyTZ
        assert(key1 === key2, `${key1} should equal ${key2}`)

      })

      it('Should create valid PK.TEZOS_HASH', () => {

        let key1 = getPublicKeyFromXY(x, y, crv, PK.TEZOS_HASH).toString('hex')
        let key2 = key.publicKeyTZH
        assert(key1 === key2, `${key1} should equal ${key2}`)

      })

    })

  })
})
