'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const ReturnCycleHelper = require('../../../support/helpers/return-cycle.helper.js')
const ReturnCycleModel = require('../../../../app/models/return-cycle.model.js')

// Thing under test
const FetchReturnCycleService = require('../../../../app/services/jobs/return-logs/fetch-return-cycle.service.js')

describe('Fetch return cycle service', () => {
  const today = new Date()
  const year = today.getFullYear()

  let allYearReturnCycle
  let summerReturnCycle
  let previousAllYearReturnCycle
  let previousSummerReturnCycle
  let summer

  before(async () => {
    allYearReturnCycle = await ReturnCycleHelper.select(3, false)
    previousAllYearReturnCycle = await ReturnCycleHelper.select(4, false)
    summerReturnCycle = await ReturnCycleHelper.select(2, true)
    previousSummerReturnCycle = await ReturnCycleHelper.select(3, true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when summer is false', () => {
    before(() => {
      summer = false
    })

    describe('and the date is after the end of april', () => {
      it('should return the correct all year return cycle UUID', async () => {
        const result = await FetchReturnCycleService.go(`${year - 3}-05-01`, summer)

        expect(result).to.equal(allYearReturnCycle.id)
      })
    })

    describe('and the date is before the end of april', () => {
      it('should return the correct all year return cycle UUID', async () => {
        const result = await FetchReturnCycleService.go(`${year - 3}-01-01`, summer)

        expect(result).to.equal(previousAllYearReturnCycle.id)
      })
    })

    describe('and the date is for the current return cycle and it has not been created yet', () => {
      before(() => {
        const stub = Sinon.stub(ReturnCycleModel, 'query')
        const selectStub = Sinon.stub().returnsThis()
        const whereStub = Sinon.stub().returnsThis()
        const limitStub = Sinon.stub().returnsThis()
        const firstStub = Sinon.stub().resolves(undefined)

        stub.returns({
          select: selectStub,
          where: whereStub,
          limit: limitStub,
          first: firstStub
        })
      })

      it('should return undefined', async () => {
        const result = await FetchReturnCycleService.go(new Date().toISOString().split('T')[0], summer)

        expect(result).to.equal(undefined)
      })
    })
  })

  describe('when summer is true', () => {
    before(() => {
      summer = true
    })

    describe('and the date is after the end of october', () => {
      it('should return the correct summer return cycle UUID', async () => {
        const result = await FetchReturnCycleService.go(`${year - 3}-12-01`, summer)

        expect(result).to.equal(summerReturnCycle.id)
      })
    })

    describe('and the date is before the end of october', () => {
      it('should return the correct summer log cycle UUID', async () => {
        const result = await FetchReturnCycleService.go(`${year - 3}-09-01`, summer)

        expect(result).to.equal(previousSummerReturnCycle.id)
      })
    })

    describe('and the date is for the current return cycle and it has not been created yet', () => {
      before(() => {
        const stub = Sinon.stub(ReturnCycleModel, 'query')
        const selectStub = Sinon.stub().returnsThis()
        const whereStub = Sinon.stub().returnsThis()
        const limitStub = Sinon.stub().returnsThis()
        const firstStub = Sinon.stub().resolves(undefined)

        stub.returns({
          select: selectStub,
          where: whereStub,
          limit: limitStub,
          first: firstStub
        })
      })

      it('should return undefined if the return cycle does not exist', async () => {
        const result = await FetchReturnCycleService.go(new Date().toISOString().split('T')[0], summer)

        expect(result).to.equal(undefined)
      })
    })
  })
})
