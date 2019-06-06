
const assert = require('assert')
const fs = require('fs-extra')
const path = require('path')

const {canSign, setWatermark} = require('../../models/watermark')
const {tzKey, op} = require('../data/all')

const TEST_DIR = path.join(__dirname, '..', 'tmp')
const TEST_FILE = path.join(TEST_DIR, 'test-watermarks')

describe('models/watermark', () => {

  describe('canSign', () => {

    it('Can sign block against non-existent watermark', () => {
      fs.removeSync(TEST_DIR)

      let tz = tzKey.p256.pkh
      assert(canSign(TEST_FILE, tz, op.block), 'Should be able to sign')

      fs.removeSync(TEST_DIR)
    })

    it('Cannot sign block against existing watermark', () => {
      fs.removeSync(TEST_DIR)

      let tz = tzKey.p256.pkh
      setWatermark(TEST_FILE, tz, op.block)
      assert(canSign(TEST_FILE, tz, op.block) === false, 'Should not be able to sign')

      fs.removeSync(TEST_DIR)
    })

    it('Cannot sign endorsement against existing watermark', () => {
      fs.removeSync(TEST_DIR)

      let tz = tzKey.p256.pkh

      setWatermark(TEST_FILE, tz, op.endorsement)
      assert(canSign(TEST_FILE, tz, op.endorsement) === false, 'Should not be able to sign')

      setWatermark(TEST_FILE, tz, op.block)
      assert(canSign(TEST_FILE, tz, op.block) === false, 'Should not be able to sign')

      fs.removeSync(TEST_DIR)
    })

  })

})
