
const getPubKey = function(keys) {
  return function(req, res, next) {
    let tz = req.params.tzKeyHash
    let key = keys[tz]
    if (key) {
      res.json({public_key: key.pk})
    } else {
      next(new Error(`No public key found for ${tz}`))
    }
  }
}

module.exports = {
  getPubKey
}
