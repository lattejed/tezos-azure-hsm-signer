
module.exports = {

  req: function(hash, op) {
    return {
      params: { tzKeyHash: hash },
      body: op
    }
  },

  res: function(cb) {
    return {
      json: function(obj) { cb(obj) },
      send: function(html) { cb(html) }
    }
  },

  next: function(cb) {
    return function(error) {
      cb(error)
    }
  }

}
