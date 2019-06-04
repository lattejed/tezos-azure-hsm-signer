
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
