
const bs58check = require('bs58check')
const TZ = require('../constants/tezos-constants')

const magic = function(op) {
  return op.slice(0, 2)
}

const isBlock = function(op) {
  return magic(op) === TZ.MAGIC_BLOCK
}

const isEndorsement = function(op) {
  return magic(op) === TZ.MAGIC_ENDORSE
}

const isGeneric = function(op) {
  return magic(op) === TZ.MAGIC_GENERIC
}

const allowedOp = function(op, allowedMagic) {
  return scrubMagic(allowedMagic).indexOf(magic(op)) !== -1
}

const scrubMagic = function(magic) {
  return magic.filter((m) => {
    return /^0x[a-fA-F0-9]{2}$/.test(m)
  }).map((m) => {
    return m.replace(/^0x/, '')
  })
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
  magic,
  isBlock,
  isEndorsement,
  isGeneric,
  allowedOp,
  blockLevel,
  chainId
}
