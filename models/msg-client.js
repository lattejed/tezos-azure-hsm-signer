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
 
const zmq = require('zeromq')
const ZMQ = require('../constants/zmq-constants')

const serverOut = zmq.socket('push')
const serverIn = zmq.socket('pull')
const clientOut = zmq.socket('push')
const clientIn = zmq.socket('pull')

const tryToConnect = function(sock, conn) {
  try {
    sock.bindSync(conn)
  } catch (error) {
    if (error.message !== ZMQ.EADDRINUSE) {
      throw error
    }
  }
}

const serverSend = function(op) {
  tryToConnect(serverOut, ZMQ.SERVER_CONN)
  serverOut.send(op)
}

const serverListen = function(callback) {
  serverIn.connect(ZMQ.CLIENT_CONN)
  serverIn.on('message', (op) => {
    callback(op.toString())
  })
}

const clientSend = function(op) {
  tryToConnect(clientOut, ZMQ.CLIENT_CONN)
  clientOut.send(op)
}

const clientListen = function(callback) {
  clientIn.connect(ZMQ.SERVER_CONN)
  clientIn.on('message', (op) => {
    callback(op.toString())
  })
}

module.exports = {
  serverSend,
  serverListen,
  clientSend,
  clientListen
}
