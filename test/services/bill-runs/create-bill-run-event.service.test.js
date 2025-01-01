'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, after } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../app/models/bill-run.model.js')
const { closeConnection } = require('../../support/database.js')
const EventModel = require('../../../app/models/event.model.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const CreateBillRunEventService = require('../../../app/services/bill-runs/create-bill-run-event.service.js')

describe('Create Bill Run Event service', () => {
  let clock
  let testDate

  beforeEach(async () => {
    testDate = new Date(2015, 9, 21, 20, 31, 57)
    clock = Sinon.useFakeTimers(testDate)
  })

  afterEach(() => {
    clock.restore()
    Sinon.restore()
  })

  after(async () => {
    await closeConnection()
  })

  describe('when a BillRunModel instance is provided', () => {
    const issuer = 'test.user@defra.gov.uk'

    let billRun

    beforeEach(async () => {
      const region = RegionHelper.select()
      const testBillRun = await BillRunHelper.add({ regionId: region.id })

      billRun = await BillRunModel.query().findById(testBillRun.id).withGraphFetched('region')
    })

    it('creates an event record', async () => {
      const result = await CreateBillRunEventService.go(billRun, issuer)

      expect(result).to.be.an.instanceOf(EventModel)

      expect(result.type).to.equal('billing-batch')
      expect(result.subtype).to.equal(billRun.batchType)
      expect(result.issuer).to.equal(issuer)
      expect(result.licences).to.equal([])
      expect(result.status).to.equal('start')
      expect(result.createdAt).to.equal(testDate)
      expect(result.updatedAt).to.equal(testDate)

      expect(result.metadata).to.exist()
      expect(result.metadata.batch.id).to.equal(billRun.id)
    })
  })
})
