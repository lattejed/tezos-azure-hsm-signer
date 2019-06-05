const assert = require('assert')
const {loadKeys} = require('../../controllers/load-keys')
const {testOps, testKeys} = require('../test-data')
const client = require('../client-mock')

describe('controllers/load-keys', () => {

  describe('loadKeys', () => {

    it('Should load keys from client', (done) => {

      loadKeys(client).then((keys) => {
        assert(keys)
        done()
      }).catch(done)

    })

  })

})
