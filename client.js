#!/usr/bin/env node

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
    let request = op // TODO:
    console.info(`Confirm transaction ${request} [Ny]?`)
    const listener = function(str, key) {
      if (key.sequence === 'y') {
        clientSend(op)
        console.info(`Transaction ${request} confirmed`)
      }
      else {
        clientSend('')
        console.info(`Transaction ${request} ignored`)
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
