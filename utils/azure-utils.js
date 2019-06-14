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

const AZ = require('../constants/azure-constants')

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
