/**
 * Tezos Azure Signer HSM
 *
 * Copyright (c) Matthew Smith
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
