
const assert = require('assert')
const bs58check = require('bs58check')
const blake2 = require('blake2')

const TZ_PRE_SIG_P256 = '36f02c34'
const TZ_PRE_SIG_P256K = '0d7365133f'

module.exports = {

  hashedMessage: function(msg) {
    assert(msg, 'Message cannot be null')
  	let h = blake2.createHash('blake2b', {digestLength: 32}).update(msg)
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
      let R = raw.slice(0, 64)
    	let S = raw.slice(64)
    	var s = BigInt('0x' + S.toString('hex'))
      var sig = null
    	if (s > P256K_HALF_ORDER) {
    		s = P256K_ORDER - s
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
