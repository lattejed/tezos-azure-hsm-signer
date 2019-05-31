
const assert = require('assert')
const bs58check = require('bs58check')
const blake2 = require('blake2')

const TZ_PRE_SIG_P256 = '36f02c34'
const TZ_PRE_SIG_P256K = '0d7365133f'

function TezosSig(key, msg) {
	if (!(this instanceof TezosSig)) {
		return new TezosSig(msg)
	}
  assert(key, 'Key cannot be null')
  assert(msg, 'Message cannot be null')
  this._key = key
  this._msg = Buffer.from(msg, 'hex')
}

TezosSig.prototype.hashedMessage = function() {
	let h = blake2.createHash('blake2b', {digestLength: 32}).update(this._msg)
	return h.digest()
}

TezosSig.prototype.signatureFromRaw = function(raw) {
  assert(raw.length === 128, 'Invalid raw signature size')
  let sig = null
  let pre = null
  if (this._key.keyCurve() === AzureKey.KeyCurve.AZ_CRV_P256) {
    pre = Buffer.from(TZ_PRE_SIG_P256, 'hex')
    sig = Buffer.from(raw, 'hex')
  }
  else if (this._key.keyCurve() === AzureKey.KeyCurve.AZ_CRV_P256K) {
    pre = Buffer.from(TZ_PRE_SIG_P256K, 'hex')
    let R = raw.slice(0, 64)
  	let S = raw.slice(64)
  	var s = BigInt('0x' + S)
  	if (s > P256K_HALF_ORDER) {
  		s = P256K_ORDER - s
  		let hs = s.toString(16).padStart(64, '0')
  		assert(hs.length === 64, 'S value of signature has invalid length')
  		sig = Buffer.from(R + hs, 'hex')
  	}
    else {
      sig = Buffer.from(raw, 'hex')
    }
  }
  else {
    assert(false, `Invalid key curve ${this._key.keyCurve()}`)
  }
  return bs58check.encode(Buffer.concat([pre, sig]))
}

module.exports = TezosSig
