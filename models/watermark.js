
const fs = require('fs-extra')
const {magic, blockLevel} = require('./operation')

const opEqual = function(wm, tz, op) {
  return wm.tz === tz && wm.op === op
}

const getWatermarks = function(file) {
  fs.ensureFileSync(file)
  let json = fs.readFileSync(file).toString()
  return json.length === 0 ? {} : JSON.parse(json)
}

const canSign = function(file, tz, op) {
  let watermarks = getWatermarks(file)
  let mb = magic(op)
  let wm = watermarks[`${tz}_${mb}`]
  if (!!wm && opEqual(wm, tz, op) && blockLevel(op) <= blockLevel(wm.op)) {
    return false
  }
  return true
}

const setWatermark = function(file, tz, op) {
  let watermarks = getWatermarks(file)
  let mb = magic(op)
  watermarks[`${tz}_${mb}`] = {
    tz: tz,
    op: op
  }
  fs.writeFileSync(file, JSON.stringify(watermarks, null, 2))
}

module.exports = {
  canSign,
  setWatermark
}
