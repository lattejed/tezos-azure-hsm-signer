
const AZ = require('./azure-constants')

const getKeyName = function(keyObj) {
	let kid = keyObj.kid || keyObj.key.kid
  let comps = kid.split('/')
  let keysIdx = comps.indexOf('keys')
	return comps[keysIdx + 1]
}

const getKeyVersion = function(keyObj) {
	let kid = keyObj.kid || keyObj.key.kid
  let comps = kid.split('/')
  let keysIdx = comps.indexOf('keys')
	return comps[keysIdx + 2]
}

const getActiveKeyVersion = function(keyObjs) {
	return keyObjs.map((versions) => {
		return versions.filter((k) => {
			return k.attributes.enabled === true
		}).sort((a, b) => {
			return b.attributes.created - a.attributes.created
		})[0] || {}
	}).filter((keyObj) => {
		return typeof keyObj.kid !== 'undefined'
	})
}

const filterValidKeyTypes = function(keyObjs) {
	return keyObjs.filter((keyObj) => {
    let c = keyObj.key.crv
    let k = keyObj.key.kty
		return (c === AZ.CRV_P256 || c === AZ.CRV_P256K) && k === AZ.KTY
	})
}

module.exports = {
  getKeyName,
  getKeyVersion,
  getActiveKeyVersion,
  filterValidKeyTypes
}
