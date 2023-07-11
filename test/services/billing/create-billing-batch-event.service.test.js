'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingBatchModel = require('../../../app/models/water/billing-batch.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const EventModel = require('../../../app/models/water/event.model.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Thing under test
const CreateBillingBatchEventService = require('../../../app/services/billing/create-billing-batch-event.service.js')

describe('Create Event service', () => {
  let clock
  let testDate

  beforeEach(async () => {
    await DatabaseHelper.clean()

    testDate = new Date(2015, 9, 21, 20, 31, 57)
    clock = Sinon.useFakeTimers(testDate)
  })

  afterEach(() => {
    clock.restore()
    Sinon.restore()
  })

  describe('when a BillingBatchModel instance is provided', () => {
    const issuer = 'test.user@defra.gov.uk'
    let billingBatch

    beforeEach(async () => {
      const region = await RegionHelper.add()
      const testBillingBatch = await BillingBatchHelper.add({ regionId: region.regionId })

      billingBatch = await BillingBatchModel.query()
        .findById(testBillingBatch.billingBatchId)
        .withGraphFetched('region')
    })

    it('creates an event record', async () => {
      const result = await CreateBillingBatchEventService.go(billingBatch, issuer)

      expect(result).to.be.an.instanceOf(EventModel)

      expect(result.type).to.equal('billing-batch')
      expect(result.subtype).to.equal(billingBatch.batchType)
      expect(result.issuer).to.equal(issuer)
      expect(result.licences).to.equal([])
      expect(result.status).to.equal('start')
      expect(result.createdAt).to.equal(testDate)
      expect(result.updatedAt).to.equal(testDate)

      expect(result.metadata).to.exist()
      expect(result.metadata.batch.id).to.equal(billingBatch.billingBatchId)
    })
  })
})
