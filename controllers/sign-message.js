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

const {createSignature} = require('../models/signature')
const operation = require('../models/operation')
const {canSign, setWatermark} = require('../models/watermark')

const TZ = require('../constants/tezos-constants')

const signMessage = function(keys, hsmClient, msgClient, vaultUri, configDir, watermark, magicBytes, sendTime) {

  return function(req, res, next) {

    let tz = req.params.tzKeyHash
    let key = keys()[tz]
    if (!key) {
      return next(new Error(`No public key found for ${tz}`))
    }
    let startTime = Date.now()
    let op = req.body
    let wm = watermark && (operation.isBlock(op) || operation.isEndorsement(op))
    let signerFunc = hsmClient.signWithClient(vaultUri, key)
    let sign = function() {

      // Get signature from hsm

      createSignature(key, op, signerFunc).then((sig) => {

        // If we are watermarking, set and check before returning sig

        if (wm) {
          setWatermark(configDir, tz, op)
          if (canSign(configDir, tz, op)) {
            return next(new Error(`Failed to set watermark for ${op}. Not returning signature.`))
          }
        }
        if (sendTime) {
          res.json({signature: sig, time: Date.now() - startTime})
        }
        else {
          res.json({signature: sig})
        }
      }).catch((error) => {
        next(error)
      })
    }

    // check high watermark if necessary

    if (wm && !canSign(configDir, tz, op)) {
      return next(new Error(`Watermark check failed for ${op}`))
    }

    // Check if we allow this op automatically

    if (operation.allowedOp(op, magicBytes)) {
      sign()
    }

    // Or request confirmation via client

    else {
      msgClient.serverListen(configDir, (resp, canSign) => {
        if (resp === op) {
          msgClient.serverListen(null)
          if (canSign === true) {
            sign()
          }
          else {
            return next(new Error(`Operation rejected by user ${op}`))
          }
        }
      })
      msgClient.serverSend(configDir, op)
    }

  }
}

module.exports = {
  signMessage
}
