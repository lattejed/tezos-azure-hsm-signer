
const assert = require('assert')
const fs = require('fs-extra')
const path = require('path')

const {
  serverSend,
  serverListen,
  clientSend,
  clientListen
} = require('../../models/msg-client')

const data = require('../data/all')

const TEST_DIR = path.join(__dirname, '..', 'tmp')

describe('models/msg-client', () => {

  describe('serverSend', () => {

    it('Should send correct op to client', (done) => {
      fs.removeSync(TEST_DIR)
      clientListen(TEST_DIR, (op) => {
        clientListen(null)
        assert(op === data.op.generic, 'Should return correct op')
        fs.removeSync(TEST_DIR)
        done()
      })
      serverSend(TEST_DIR, data.op.generic)
    })

  })

  describe('clientSend', () => {

    it('Should accept op', (done) => {
      fs.removeSync(TEST_DIR)
      serverListen(TEST_DIR, (op, status) => {
        serverListen(null)
        assert(op === data.op.generic && status === true, 'Should return correct op, accept')
        fs.removeSync(TEST_DIR)
        done()
      })
      clientSend(TEST_DIR, data.op.generic, true)
    })

    it('Should reject op', (done) => {
      fs.removeSync(TEST_DIR)
      serverListen(TEST_DIR, (op, status) => {
        serverListen(null)
        assert(op === data.op.generic && status === false, 'Should return correct op, reject')
        fs.removeSync(TEST_DIR)
        done()
      })
      clientSend(TEST_DIR, data.op.generic, false)
    })

  })

})
