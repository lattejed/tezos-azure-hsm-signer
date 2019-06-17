#!/usr/bin/env node

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

const os = require('os')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')

const APP = require('./constants/app-constants')

const hsmClient = require('./models/hsm-client')
const msgClient = require('./models/msg-client')

const {loadKeys} = require('./controllers/load-keys')
const {getAuthorizedKeys} = require('./controllers/get-authorized-keys')
const {getPubKey} = require('./controllers/get-pubkey')
const {signMessage} = require('./controllers/sign-message')
const {handleError} = require('./controllers/handle-error')

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .alias('M', 'magic-bytes')
  .alias('W', 'check-high-watermark')
  .alias('a', 'address')
  .alias('p', 'port')
  .alias('t', 'send-sign-timing')
  .boolean(['check-high-watermark'])
  .default({M: '0x01,0x02', W: true, a: '127.0.0.1', p: 6732, t: false})
  .help('h')
  .alias('h', 'help')
  .argv

const KEYVAULT_URI = process.env.AZURE_KEYVAULT_URI
const ADDRESS = argv.address
const PORT = argv.port
const CHECK_HIGH_WATERMARK = argv.checkHighWatermark
const MAGIC_BYTES = argv.magicBytes.split(',')
const SEND_SIGN_TIME = argv.sendSignTiming

const app = express()
const server = http.createServer(app)

let _cachedKeys = {}
const cachedKeys = function() {
  return _cachedKeys
}

app.use(bodyParser.json({strict: false}))
app.get('/authorized_keys', getAuthorizedKeys())
app.get('/keys/:tzKeyHash', getPubKey(cachedKeys))
app.post('/keys/:tzKeyHash', signMessage(
  cachedKeys, hsmClient, msgClient,
  KEYVAULT_URI, APP.CONFIG_DIR,
  CHECK_HIGH_WATERMARK, MAGIC_BYTES, SEND_SIGN_TIME
))
app.use(handleError())

server.on('listening', () => {
  console.info(`Server listening at http://${ADDRESS}:${PORT}`)
  console.info(`Loading keys...`)
  loadKeys(hsmClient, KEYVAULT_URI).then((keys) => {
    _cachedKeys = keys
    console.info(`Loaded keys:\n${JSON.stringify(keys, null, 2)}`)
  }).catch((error) => {
    console.error(`Unable to load keys, exiting`)
    console.error(error)
    process.exit(1)
  })
})

server.on('error', (error) => {
  console.error(`Server encountered error, exiting`)
  console.error(error)
  process.exit(1)
})

server.listen(PORT, ADDRESS)
