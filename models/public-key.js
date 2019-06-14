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
const PK = require('../constants/pubkey-constants')
const AZ = require('../constants/azure-constants')
const TZ = require('../constants/tezos-constants')

const getPublicKeyFromXY = function(x, y, crv, fmt) {
  assert(Buffer.isBuffer(x) && Buffer.isBuffer(y), 'X and Y must be buffers')

  /*
   * Uncompressed EC Public Keys are of the format:
   * 0x04 + X + Y
   */

  if (fmt === PK.UNCOMPRESSED) {

    let pre = Buffer.from('04', 'hex')
    return Buffer.concat([pre, x, y])

  }

  /*
   * Compressed EC Public Keys are of the format:
   * parity byte + X where
   * parity byte = 0x02 if Y is even
   *             = 0x03 is Y is odd
   *
   */

  else if (fmt === PK.COMPRESSED) {

    let biy = BigInt('0x' + y.toString('hex'))
    let pre = Buffer.from(biy % BigInt(2) == 0 ? '02' : '03', 'hex')
    return Buffer.concat([pre, x])

  }

  /*
   * Tezos public keys are of the format
   * prefix + compressed public key
   * base58 encoded with a checksum
   */

  else if (fmt === PK.TEZOS) {

    let pk = getPublicKeyFromXY(x, y, crv, PK.COMPRESSED)
    if (crv === AZ.CRV_P256) {
      var pre = Buffer.from(TZ.PRE_PK_P256, 'hex')
    }
    else if (crv === AZ.CRV_P256K) {
      var pre = Buffer.from(TZ.PRE_PK_P256K, 'hex')
    }
    else {
      assert(false, `Invalid key curve ${crv}`)
    }
    return bs58check.encode(Buffer.concat([pre, pk]))

  }

  /*
   * Tezos public key hashes are of the format
   * prefix + blake2b has of compressed public key
   * base58 encoded with a checksum
   */

  else if (fmt === PK.TEZOS_HASH) {

    let pk = getPublicKeyFromXY(x, y, crv, PK.COMPRESSED)

    if (crv === AZ.CRV_P256) {
      var pre = Buffer.from(TZ.PRE_PKH_P256, 'hex')
    }
    else if (crv === AZ.CRV_P256K) {
      var pre = Buffer.from(TZ.PRE_PKH_P256K, 'hex')
    }
    else {
      assert(false, `Invalid key curve ${crv}`)
    }


    let h = blake2.createHash('blake2b', {digestLength: 20}).update(pk)
    let pkh = Buffer.concat([pre, h.digest()])
    return bs58check.encode(pkh)

  }

  else {
    assert(false, `Invalid public key format ${fmt}`)
  }

}

module.exports = {
  getPublicKeyFromXY
}
