
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

const serverSend = function(msg) {
  tryToConnect(serverOut, ZMQ.SERVER_CONN)
  serverOut.send(msg)
}

const serverListen = function(callback) {
  serverIn.connect(ZMQ.CLIENT_CONN)
  serverIn.on('message', (msg) => {
    callback(msg.toString())
  })
}

const clientSend = function(msg) {
  tryToConnect(clientOut, ZMQ.CLIENT_CONN)
  clientOut.send(msg)
}

const clientListen = function(callback) {
  clientIn.connect(ZMQ.SERVER_CONN)
  clientIn.on('message', (msg) => {
    callback(msg.toString())
  })
}

module.exports = {
  serverSend,
  serverListen,
  clientSend,
  clientListen
}
