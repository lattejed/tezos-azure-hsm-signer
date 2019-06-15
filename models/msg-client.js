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


const path = require('path')
const fs = require('fs-extra')
const MSG_FILE = 'messages.json'
const MSG_STATUS = {
  WAITING: 'WAITING',
  ACCEPT: 'ACCEPT',
  REJECT: 'REJECT'
}
const POLL_INTVAL = 300

let timers = []

const getMessages = function(dir) {
  let file = path.join(dir, MSG_FILE)
  fs.ensureFileSync(file)
  let json = fs.readFileSync(file).toString()
  return json.length === 0 ? {} : JSON.parse(json)
}

const setMessages = function(dir, msgs) {
  let file = path.join(dir, MSG_FILE)
  fs.writeFileSync(file, JSON.stringify(msgs, null, 2))
}

const setMessage = function(dir, op, status) {
  let msgs = getMessages(dir)
  msgs[op] = status
  setMessages(dir, msgs)
}

const deleteMessage = function(dir, op) {
  let msgs = getMessages(dir)
  delete msgs[op]
  setMessages(dir, msgs)
}

const deleteAllMessages = function(dir) {
  fs.removeSync(dir)
}

const poll = function(dir, statuses, callback) {
  let timer = setInterval(() => {
    let msgs = getMessages(dir)
    for (let op in msgs) {
      if (statuses.indexOf(msgs[op]) > -1) {
        callback(op, msgs[op])
        break
      }
    }
  }, POLL_INTVAL)
  timers.push(timer)
}

const clientListen = function(dir, callback) {
  if (dir === null) {
    teardown()
  }
  else {
    deleteAllMessages(dir) // Flush queue
    poll(dir, [MSG_STATUS.WAITING], (op, status) => {
      deleteMessage(dir, op)
      callback(op)
    })
  }
}

const serverListen = function(dir, callback) {
  if (dir === null) {
    teardown()
  }
  else {
    poll(dir, [MSG_STATUS.ACCEPT, MSG_STATUS.REJECT], (op, status) => {
      deleteMessage(dir, op)
      callback(op, status === MSG_STATUS.ACCEPT)
    })
  }
}

const serverSend = function(dir, op) {
  setMessage(dir, op, MSG_STATUS.WAITING)
}

const clientSend = function(dir, op, accept) {
  if (accept === true) {
    setMessage(dir, op, MSG_STATUS.ACCEPT)
  }
  else {
    setMessage(dir, op, MSG_STATUS.REJECT)
  }
}

const teardown = function() {
  timers.forEach((timer) => {
    clearInterval(timer)
  })
  timers = []
}

module.exports = {
  serverSend,
  serverListen,
  clientSend,
  clientListen
}
