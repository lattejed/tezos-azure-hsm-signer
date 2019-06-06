
const assert = require('assert')
const {op} = require('../data/all')
const {
  isBlock,
  isEndorsement,
  isGeneric,
  blockLevel,
  chainId
} = require('../../models/operation')

describe('models/operation', () => {

  describe('isBlock', () => {

    it('Should validate a block', () => {

      assert(isBlock(op.block), `Block should be valid`)
    })

    it('Should not validate a not block', () => {

      assert(isBlock(op.generic) === false, `Block should be invalid`)
    })


  })

  describe('isEndorsement', () => {

    it('Should validate an endorsement', () => {

      assert(isEndorsement(op.endorsement), `Endorsement should be valid`)
    })

  })

  describe('isGeneric', () => {

    it('Should validate a generic op', () => {

      assert(isGeneric(op.generic), `Generic op should be valid`)
    })

  })

  describe('blockLevel', () => {

    it('Should return correct block level for block', () => {
      assert(blockLevel(op.block) === 146930, `Wrong block level`)
    })

    it('Should return correct block level for endorsement', () => {
      assert(blockLevel(op.endorsement) === 256877, `Wrong block level`)
    })

  })

  describe('chainId', () => {

    it('Should return correct chainId for block', () => {
      assert(chainId(op.block) === 'NetXgtSLGNJvNye', `Wrong chain id`)
    })

    it('Should return correct chainId for endorsement', () => {
      assert(chainId(op.endorsement) === 'NetXdQprcVkpaWU', `Wrong chain id`)
    })

    it('Should return correct chainId for generic op', () => {
      assert(chainId(op.generic) === 'NetXeSG6ShTTieu', `Wrong chain id`)
    })

  })


})
