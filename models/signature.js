
const assert = require('assert')
const blake2 = require('blake2')
const bs58check = require('bs58check')
const AZ = require('../constants/azure-constants')
const TZ = require('../constants/tezos-constants')
const K = require('../constants/secp256k1-constants')

const createSignature = function(key, msg, hsmSignerFunc) {
  assert(key, 'A key is required')
  assert(typeof msg === 'string', 'Message must be a hex string')
  assert(hsmSignerFunc, 'A signer function is required')

  /*
   *
   */

  let m = Buffer.from(msg, 'hex')
  let h = blake2.createHash('blake2b', {digestLength: 32})
  h.update(m)
  let hash = h.digest()

  return hsmSignerFunc(key, hash).then((raw) => {

    assert(Buffer.isBuffer(raw) && raw.length === 64, 'Raw signature must be a 64-byte buffer')

    /*
     *
     */

    if (key.algo === AZ.SIGN_ALGO_P256) {

      let pre = Buffer.from(TZ.PRE_SIG_P256, 'hex')
      let sig = Buffer.from(raw, 'hex')
      return Promise.resolve(bs58check.encode(Buffer.concat([pre, sig])))
    }

    /*
     *
     */

    else if (key.algo === AZ.SIGN_ALGO_P256K) {

      /*
       * Enforce small S value
       */

      let pre = Buffer.from(TZ.PRE_SIG_P256K, 'hex')
      let R = raw.slice(0, 32).toString('hex')
      let S = raw.slice(32).toString('hex')
      var s = BigInt('0x' + S)
      if (s > BigInt(K.CURVE_HALF_ORDER)) {
        s = BigInt(K.CURVE_ORDER) - s
        let hs = s.toString(16).padStart(64, '0')
        assert(hs.length === 64, 'S value of signature has invalid length')
        var sig = Buffer.from(R + hs, 'hex')
      }
      else {
        var sig = raw
      }
      return Promise.resolve(bs58check.encode(Buffer.concat([pre, sig])))
    }
  })

}

module.exports = {
  createSignature
}
