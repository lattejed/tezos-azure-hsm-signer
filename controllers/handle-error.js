
const handleError = function() {
  return function(err, req, res, next) {
    console.error(err.message)
    res.status(500).send(`Error: ${err.message}`)
  }
}

module.exports = {
  handleError
}
