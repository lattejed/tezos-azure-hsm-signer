
function MsgClient(accept) {
  if (!(this instanceof MsgClient)) {
    return new MsgClient(accept)
  }
  this._accept = accept
  this._serverCallback = null
}

MsgClient.prototype.serverSend = function(dir, op) {
  this._serverCallback(op, this._accept)
}

MsgClient.prototype.serverListen = function(dir, callback) {
  this._serverCallback = callback
}

module.exports = MsgClient
