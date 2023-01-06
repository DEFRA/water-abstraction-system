'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchModel = require('../../../app/models/water/billing-batch.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const EventModel = require('../../../app/models/water/event.model.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Things we need to stub
const BillingPeriodService = require('../../../app/services/supplementary-billing/billing-period.service.js')

// Thing under test
const InitiateBillingBatchService = require('../../../app//services/supplementary-billing/initiate-billing-batch.service.js')

describe('Initiate Billing Batch service', () => {
  const currentBillingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  let validatedRequestData

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const region = await RegionHelper.add()
    validatedRequestData = {
      type: 'supplementary',
      scheme: 'sroc',
      region: region.regionId,
      user: 'test.user@defra.gov.uk'
    }

    Sinon.stub(BillingPeriodService, 'go').returns([currentBillingPeriod])
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('creates a new billing batch record', async () => {
    await InitiateBillingBatchService.go(validatedRequestData)

    const count = await BillingBatchModel.query().resultSize()

    expect(count).to.equal(1)
  })

  it('creates a new event record', async () => {
    await InitiateBillingBatchService.go(validatedRequestData)

    const count = await EventModel.query().resultSize()

    expect(count).to.equal(1)
  })

  it('returns a response', async () => {
    const result = await InitiateBillingBatchService.go(validatedRequestData)

    const billingBatch = await BillingBatchModel.query().first()

    expect(result.id).to.equal(billingBatch.billingBatchId)
    expect(result.region).to.equal(billingBatch.regionId)
    expect(result.scheme).to.equal('sroc')
    expect(result.batchType).to.equal('supplementary')
    expect(result.status).to.equal('processing')
  })
})
