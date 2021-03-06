/**
 * Tezos Azure Signer HSM
 *
 * Copyright (c) Matthew Smith <m@lattejed.com>
 * All rights reserved.
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
 * to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

const assert = require('assert')
const blake2 = require('blake2')
const bs58check = require('bs58check')

const AZ = require('../constants/azure-constants')
const TZ = require('../constants/tezos-constants')
const K = require('../constants/secp256k1-constants')

const createSignature = function(key, op, hsmSignerFunc) {
  assert(key, 'A key is required')
  assert(typeof op === 'string', 'Op must be a hex string')
  assert(hsmSignerFunc, 'A signer function is required')

  /*
   * Blake2B hash the incoming op. Digest length must be 32.
   */

  let m = Buffer.from(op, 'hex')
  let h = blake2.createHash('blake2b', {digestLength: 32})
  h.update(m)
  let hash = h.digest()

  return hsmSignerFunc(key, hash).then((result) => {

    /*
     * Signer must return a 64 byte buffer
     */

    let raw = result.result

    assert(Buffer.isBuffer(raw) && raw.length === 64, 'Raw signature must be a 64-byte buffer')

    /*
     * P256 signatures are of the format
     * prefix + raw signature base58 encoded with a checksum
     */

    if (key.signAlgo === AZ.SIGN_ALGO_P256) {

      let pre = Buffer.from(TZ.PRE_SIG_P256, 'hex')
      let sig = raw
      return Promise.resolve(bs58check.encode(Buffer.concat([pre, sig])))
    }

    /*
     * P256K signatures are of the format
     * prefix + raw signature base58 encoded with a checksum
     * S values must be in the lower half of the curve's order
     */

    else if (key.signAlgo === AZ.SIGN_ALGO_P256K) {

      /*
       * Enforce small S values
       * https://github.com/bitcoin/bips/blob/master/bip-0062.mediawiki#Low_S_values_in_signatures
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

    else {
      return Promise.reject(new Error(`Invalid signing algorithm ${key.signAlgo}`))
    }
  })

}

module.exports = {
  createSignature
}
