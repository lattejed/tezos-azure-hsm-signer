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

const readline = require('readline')
const stdin = process.stdin
const {clientListen, clientSend} = require('./models/msg-client')

readline.emitKeypressEvents(stdin)
if (stdin.isTTY) {
  stdin.setRawMode(true)
}

stdin.on('keypress', (str, key) => {
  if (key.sequence === '\u0003') {
    console.info(`Ctrl-C received. Exiting...`)
    process.exit(0)
  }
})

try {
  clientListen((op) => {
    console.info(`Confirm transaction ${op} [Ny]?`)
    const listener = function(str, key) {
      if (key.sequence === 'y') {
        clientSend(op)
        console.info(`Transaction ${op} confirmed`)
      }
      else {
        clientSend('')
        console.info(`Transaction ${op} ignored`)
      }
      stdin.removeListener('keypress', listener)
    }
    stdin.on('keypress', listener)
  })
}
catch (error) {
  console.error(`There was an error listening for requests: ${error}`)
  console.error(`Exiting...`)
  process.exit(1)
}

console.info(`Waiting for signing request. Ctrl-C to quit.`)
