
const assert = require('assert')
const bs58check = require('bs58check')
const blake2 = require('blake2')
const AzureKey = require('./AzureKey')

const TZ_PRE_SIG_P256 = '36f02c34'
const TZ_PRE_SIG_P256K = '0d7365133f'

const P256K_ORDER =
  '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'
const P256K_HALF_ORDER =
  '0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0'

module.exports = {

  hashedMessage: function(msg) {
    assert(msg, 'Message cannot be null')
    let m = Buffer.from(msg, 'hex')
  	let h = blake2.createHash('blake2b', {digestLength: 32}).update(m)
  	return h.digest()
  },

  signatureFromRaw: function(key, raw) {
    assert(raw.length === 64, 'Invalid raw signature size')
    if (key.signAlgo === AzureKey.SignAlgo.P256) {
      let pre = Buffer.from(TZ_PRE_SIG_P256, 'hex')
      let sig = Buffer.from(raw, 'hex')
      return bs58check.encode(Buffer.concat([pre, sig]))
    }
    else if (key.signAlgo === AzureKey.SignAlgo.P256K) {
      let pre = Buffer.from(TZ_PRE_SIG_P256K, 'hex')
      let R = raw.slice(0, 32).toString('hex')
      let S = raw.slice(32).toString('hex')
      var s = BigInt('0x' + S)
      var sig = null
      if (s > BigInt(P256K_HALF_ORDER)) {
        s = BigInt(P256K_ORDER) - s
        let hs = s.toString(16).padStart(64, '0')
        assert(hs.length === 64, 'S value of signature has invalid length')
        sig = Buffer.from(R + hs, 'hex')
      }
      else {
        sig = raw
      }
      return bs58check.encode(Buffer.concat([pre, sig]))
    }
    else {
      assert(false, `Invalid sign algo ${key.signAlgo}`)
    }
  }
}
