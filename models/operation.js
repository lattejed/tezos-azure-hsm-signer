
const bs58check = require('bs58check')
const TZ = require('../constants/tezos-constants')

const isBlock = function(op) {
  return op.slice(0, 2) === TZ.MAGIC_BLOCK
}

const isEndorsement = function(op) {
  return op.slice(0, 2) === TZ.MAGIC_ENDORSE
}

const isGeneric = function(op) {
  return op.slice(0, 2) === TZ.MAGIC_GENERIC
}

const blockLevel = function(op) {
  if (isBlock(op)) {
    return parseInt(op.slice(10, 18), 16)
  }
  else {
    return parseInt(op.slice(op.length - 8), 16)
  }
}

const chainId = function(op) {
  let pre = Buffer.from(TZ.PRE_CHAIN_ID, 'hex')
  let id = Buffer.from(op.slice(2, 10), 'hex')
  return bs58check.encode(Buffer.concat([pre, id]))
}

module.exports = {
  isBlock,
  isEndorsement,
  isGeneric,
  blockLevel,
  chainId
}
