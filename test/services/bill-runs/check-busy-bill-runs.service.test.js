'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Things we need to stub
const { db } = require('../../../db/db.js')

// Thing under test
const CheckBusyBillRunsService = require('../../../app/services/bill-runs/check-busy-bill-runs.service.js')

describe('Check Busy Bill Runs service', () => {
  afterEach(async () => {
    Sinon.restore()
  })

  describe('when there are both building and cancelling bill runs', () => {
    beforeEach(() => {
      Sinon.stub(db, 'select').resolves([{ cancelling: true, building: true }])
    })

    it('returns "both"', async () => {
      const result = await CheckBusyBillRunsService()

      expect(result).toEqual('both')
    })
  })

  describe('when there are cancelling bill runs', () => {
    beforeEach(() => {
      Sinon.stub(db, 'select').resolves([{ cancelling: true, building: false }])
    })

    it('returns "cancelling"', async () => {
      const result = await CheckBusyBillRunsService()

      expect(result).toEqual('cancelling')
    })
  })

  describe('when there are building bill runs', () => {
    beforeEach(() => {
      Sinon.stub(db, 'select').resolves([{ cancelling: false, building: true }])
    })

    it('returns "building"', async () => {
      const result = await CheckBusyBillRunsService()

      expect(result).toEqual('building')
    })
  })

  describe('when there are no building or cancelling bill runs', () => {
    beforeEach(() => {
      Sinon.stub(db, 'select').resolves([{ cancelling: false, building: false }])
    })

    it('returns "none"', async () => {
      const result = await CheckBusyBillRunsService()

      expect(result).toEqual('none')
    })
  })
})
