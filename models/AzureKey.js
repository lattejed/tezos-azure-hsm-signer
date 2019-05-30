
const assert = require('assert')
const bs58check = require('bs58check')
const blake2 = require('blake2')

const TZ_PRE_PK_P256 = '03b28b7f'
const TZ_PRE_PKH_P256 = '06a1a4'
const TZ_PRE_PK_P256K = '03fee256'
const TZ_PRE_PKH_P256K = '06a1a1'
const AZ_CRV_P256 = 'P-256'
const AZ_CRV_P256K = 'P-256K'
const AZ_KTY = 'EC-HSM'

/*
 *
 */

function AzureKey(keyObj) {
	if (!(this instanceof AzureKey)) {
		return new AzureKey(keyObj)
	}
	assert(keyObj.key.x.length === 32 && keyObj.key.y.length === 32,
		`Invalid X and Y sizes for PubKey`)
	assert(keyObj.key.crv === AZ_CRV_P256 || keyObj.key.crv == AZ_CRV_P256K,
		`AzureKey unsupported key curve ${keyObj.key.crv}`)
	assert(keyObj.key.kty === AZ_KTY,
		`AzureKey unsupported key type ${keyObj.key.kty}`)
	this._keyObj = keyObj
	console.log(this.name)
}

AzureKey.PubKeyFormat = {
	UNCOMPRESSED: 'UNCOMPRESSED',
	COMPRESSED: 'COMPRESSED',
	TEZOS: 'TEZOS',
	TEZOS_HASH: 'TEZOS_HASH'
}

AzureKey.keyName = function(keyObj) {
	let comps = keyObj.key.kid.split('/')
	let keysIdx = comps.indexOf('keys')
	return comps[keysIdx + 1]
}

AzureKey.keyVersion = function(keyObj) {
	let comps = keyObj.key.kid.split('/')
	let keysIdx = comps.indexOf('keys')
	return comps[keysIdx + 2]
}

AzureKey.filterValid = function(keyObjs) {
	return keyObjs.filter((keyObj) => {
		return (keyObj.key.crv === AZ_CRV_P256
						|| keyObj.key.crv === AZ_CRV_P256K)
							&& keyObj.key.kty === AZ_KTY
	})
}

AzureKey.filterActive = function(keyObjs) {
	return keyObjs.map((versions) => {
		return versions.filter((k) => {
			return k.attributes.enabled === true
		}).sort((a, b) => {
			return b.attributes.created - a.attributes.created
		})[0] || {}
	}).filter((keyObj) => {
		return typeof keyObj.key.kid !== 'undefined'
	})
}

AzureKey.prototype.keyName = function() {
	return AzureKey.keyName(this._keyObj)
}

AzureKey.prototype.keyVersion = function() {
	return AzureKey.keyVersion(this._keyObj)
}

/*
 * Uncompressed EC Public Keys are of the format:
 * 0x04 + X + Y
 *
 * Compressed EC Public Keys are of the format:
 * Parity byte + X where
 * Parity byte = 0x02 if Y is even
 *             = 0x03 is Y is odd
 *
 * Tezos ...
 */

AzureKey.prototype.publicKey = function(fmt) {
	if (fmt === AzureKey.PubKeyFormat.UNCOMPRESSED) {
		let pre = Buffer.from('04', 'hex')
		return Buffer.concat([pre, this._keyObj.key.x, this._keyObj.key.y])
	}
	else if (fmt === AzureKey.PubKeyFormat.COMPRESSED) {
		let iy = BigInt('0x' + this._keyObj.key.y.toString('hex'))
		let pre = Buffer.from(iy % BigInt(2) == 0 ? '02' : '03', 'hex')
		return Buffer.concat([pre, this._keyObj.key.x])
	}
	else if (fmt === AzureKey.PubKeyFormat.TEZOS) {
		let pk = this.publicKey(AzureKey.PubKeyFormat.COMPRESSED)
		let pre = null
		if (this._keyObj.key.crv === AZ_CRV_P256) {
			pre = Buffer.from(TZ_PRE_PK_P256, 'hex')
		}
		else if (this._keyObj.key.crv === AZ_CRV_P256K) {
			pre = Buffer.from(TZ_PRE_PK_P256K, 'hex')
		}
		else {
			assert(false, `Invalid key curve ${this._keyObj.key.crv}`)
		}
		return bs58check.encode(Buffer.concat([pre, pk]))
	}
	else if (fmt === AzureKey.PubKeyFormat.TEZOS_HASH) {
		let pk = this.publicKey(AzureKey.PubKeyFormat.COMPRESSED)
		let pre = null
		if (this._keyObj.key.crv === AZ_CRV_P256) {
			pre = Buffer.from(TZ_PRE_PKH_P256, 'hex')
		}
		else if (this._keyObj.key.crv === AZ_CRV_P256K) {
			pre = Buffer.from(TZ_PRE_PKH_P256K, 'hex')
		}
		else {
			assert(false, `Invalid key curve ${this._keyObj.key.crv}`)
		}
		let h = blake2.createHash('blake2b', {digestLength: 20}).update(pk)
		let pkh = Buffer.concat([pre, h.digest()])
		return bs58check.encode(pkh)
	}
	else {
		assert(false, `Invalid public key format ${fmt}`)
	}
}

module.exports = AzureKey
