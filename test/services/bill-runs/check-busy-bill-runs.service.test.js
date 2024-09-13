'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

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
      const result = await CheckBusyBillRunsService.go()

      expect(result).to.equal('both')
    })
  })

  describe('when there are cancelling bill runs', () => {
    beforeEach(() => {
      Sinon.stub(db, 'select').resolves([{ cancelling: true, building: false }])
    })

    it('returns "cancelling"', async () => {
      const result = await CheckBusyBillRunsService.go()

      expect(result).to.equal('cancelling')
    })
  })

  describe('when there are building bill runs', () => {
    beforeEach(() => {
      Sinon.stub(db, 'select').resolves([{ cancelling: false, building: true }])
    })

    it('returns "building"', async () => {
      const result = await CheckBusyBillRunsService.go()

      expect(result).to.equal('building')
    })
  })

  describe('when there are no building or cancelling bill runs', () => {
    beforeEach(() => {
      Sinon.stub(db, 'select').resolves([{ cancelling: false, building: false }])
    })

    it('returns "none"', async () => {
      const result = await CheckBusyBillRunsService.go()

      expect(result).to.equal('none')
    })
  })
})
