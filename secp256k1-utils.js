
const assert = require('assert')
const tiny = require('tiny-secp256k1')
const bs58check = require('bs58check')
const blake2 = require('blake2')

const PRE_SECP256K1_PK_UNCOMP = '04'
const PRE_TZ_SECP256K1_PK = '03fee256'
const PRE_TZ_SECP256K1_PKH = '06a1a1'

/*
 * A representation of a secp256k1 public key that
 * takes buffers of x and y values and produces
 * public keys in standard and Tezos-specific formats
 */

function PubKeySecp256k1(x, y) {
	if (!(this instanceof PubKeySecp256k1)) {
		return new PubKeySecp256k1(x, y)
	}
	assert(x.length === 32 && y.length === 32,
		'Invalid X and Y values for PubKey')
	this.x = x
	this.y = y
}

/*
 * Uncompressed EC Public Keys are of the format:
 * 0x04 + X + Y
 */

PubKeySecp256k1.prototype.publicKeyUncompressed = function() {
	let bp = Buffer.from(PRE_SECP256K1_PK_UNCOMP, 'hex')
	return Buffer.concat([bp, this.x, this.y])
}

/*
 * Compressed EC Public Keys are of the format:
 * Parity byte + X where
 * Parity byte = 0x02 if Y is even
 *             = 0x03 is Y is odd
 */

PubKeySecp256k1.prototype.publicKey = function() {
	let pk = this.publicKeyUncompressed()
	return tiny.pointCompress(pk, true)
}

/*
 * Generate a Base58 checksum encoded Public Key with
 * an `sppk` prefix. This is the format that Tezos expects
 * for secp256k1 public keys
 */

PubKeySecp256k1.prototype.publicKeySPPKFormat = function() {
	let pk = this.publicKey()
	let pre = Buffer.from(PRE_TZ_SECP256K1_PK, 'hex')
	return bs58check.encode(Buffer.concat([pre, pk]))
}

/*
 *
 */

PubKeySecp256k1.prototype.publicKeyHashTz2Format = function() {
	let pk = this.publicKey()
	let pre = Buffer.from(PRE_TZ_SECP256K1_PKH, 'hex')
	let h = blake2.createHash('blake2b', {digestLength: 20})
	h.update(pk)
	let pkh = Buffer.concat([pre, h.digest()])
	return bs58check.encode(pkh)
}

module.exports = {
	PubKeySecp256k1
}
