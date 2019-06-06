
const assert = require('assert')
const {getPublicKeyFromXY} = require('./public-key')

const PK = require('../constants/pubkey-constants')
const AZ = require('../constants/azure-constants')

const getKeyFromHSMKey = function(key) {

  let {x, y, crv, kid} = key.key

  assert(x && y && crv && kid, 'A valid key is required')

  let k = {
    kid: kid,
    uncompressed: getPublicKeyFromXY(x, y, crv, PK.UNCOMPRESSED),
    compressed: getPublicKeyFromXY(x, y, crv, PK.COMPRESSED),
    pk: getPublicKeyFromXY(x, y, crv, PK.TEZOS),
    pkh: getPublicKeyFromXY(x, y, crv, PK.TEZOS_HASH)
  }

  if (crv === AZ.CRV_P256) {
    k.signAlgo = AZ.SIGN_ALGO_P256
  }
  else if (crv === AZ.CRV_P256K) {
    k.signAlgo = AZ.SIGN_ALGO_P256K
  }
  else {
    assert(false, `Invalid key curve ${crv}`)
  }

  return k
}

module.exports = {
  getKeyFromHSMKey
}
