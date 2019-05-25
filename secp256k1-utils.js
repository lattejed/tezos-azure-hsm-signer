
const assert = require('assert')
const tiny = require('tiny-secp256k1')
const bs58check = require('bs58check')
const blake2 = require('blake2')

const PRE_SECP256K1_PK_UNCOMP = '04'
const PRE_TZ_SECP256K1_PK = '03fee256'
const PRE_TZ_SECP256K1_PKH = '06a1a1'
const PRE_TZ_SECP256K1_SIG = '0d7365133f'
const TZ_SECP256K1_SIG_LEN = 99
const SECP256K1_ORDER = BigInt(
	'0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'
)
const SECP256K1_HALF_ORDER = BigInt(
	'0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0'
)

/*
 * A representation of a secp256k1 public key that
 * takes buffers of x and y values and produces
 * public keys in standard and Tezos-specific formats
 */

function KeySecp256k1(x, y) {
	if (!(this instanceof KeySecp256k1)) {
		return new KeySecp256k1(x, y)
	}
	assert(x.length === 32 && y.length === 32,
		'Invalid X and Y values for PubKey')
	this._x = x
	this._y = y
}

/*
 * This is for testing with a local (insecure) private key
 */

KeySecp256k1.fromKeypair = function(privateKey, publicKey) {
	assert(tiny.isPrivate(privateKey))
	assert(tiny.isPoint(publicKey))
	let x = publicKey.slice(1, 33)
	let y = publicKey.slice(33)
	let key = new KeySecp256k1(x, y)
	key._privateKey = privateKey
	return key
}

/*
 * Uncompressed EC Public Keys are of the format:
 * 0x04 + X + Y
 */

KeySecp256k1.prototype.publicKeyUncompressed = function() {
	let pb = Buffer.from(PRE_SECP256K1_PK_UNCOMP, 'hex')
	return Buffer.concat([pb, this._x, this._y])
}

/*
 * Compressed EC Public Keys are of the format:
 * Parity byte + X where
 * Parity byte = 0x02 if Y is even
 *             = 0x03 is Y is odd
 */

KeySecp256k1.prototype.publicKey = function() {
	let pk = this.publicKeyUncompressed()
	return tiny.pointCompress(pk, true)
}

/*
 * Generate a Base58 checksum encoded Public Key with
 * an `sppk` prefix. This is the format that Tezos expects
 * for secp256k1 public keys
 */

KeySecp256k1.prototype.publicKeySPPKFormat = function() {
	let pk = this.publicKey()
	let pre = Buffer.from(PRE_TZ_SECP256K1_PK, 'hex')
	return bs58check.encode(Buffer.concat([pre, pk]))
}

/*
 *
 */

KeySecp256k1.prototype.publicKeyHashTz2Format = function() {
	let pk = this.publicKey()
	let pre = Buffer.from(PRE_TZ_SECP256K1_PKH, 'hex')
	let h = blake2.createHash('blake2b', {digestLength: 20})
	h.update(pk)
	let pkh = Buffer.concat([pre, h.digest()])
	return bs58check.encode(pkh)
}

/*
 * This is for testing with a local (insecure) private key
 */

KeySecp256k1.prototype.sign = function(hash) {
	assert(tiny.isPrivate(this._privateKey))
	return tiny.sign(hash, this._privateKey)
}

KeySecp256k1.hashForSignOperation = function(payload) {
	let h = blake2.createHash('blake2b', {digestLength: 32})
	h.update(payload)
	return h.digest()
}

// https://github.com/bitcoin/bips/blob/master/bip-0062.mediawiki#low-s-values-in-signatures

KeySecp256k1.enforceSmallSForSig = function(sig) {
	let R = sig.slice(0, 64)
	let S = sig.slice(64)
	assert(R.length === 64 && S.length === 64)
	var s = BigInt('0x' + S)
	if (s > SECP256K1_HALF_ORDER) {
		s = SECP256K1_ORDER - s
		let hs = s.toString(16).padStart(64, '0')
		assert(hs.length === 64, 'S value of signature has invalid length')
		return R + hs
	} else {
		return sig
	}
}

KeySecp256k1.signatureInTzFormat = function(signature) {
	assert(signature.length === 128, 'Invalid signature length')
	assert(/^spsig1/.test(signature) === false, 'Signature already in Tezos format')
	let pre = Buffer.from(PRE_TZ_SECP256K1_SIG, 'hex')
	let sig = Buffer.from(signature, 'hex')
	let tzsig = bs58check.encode(Buffer.concat([pre, sig]))
	assert(tzsig.length === TZ_SECP256K1_SIG_LEN, `Signature ${tzsig} has invalid length`)
	return tzsig
}

module.exports = {
	KeySecp256k1
}
