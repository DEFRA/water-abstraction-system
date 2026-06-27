'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../app/models/bill-run.model.js')
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

      expect(result).toBeInstanceOf(EventModel)

      expect(result.type).toEqual('billing-batch')
      expect(result.subtype).toEqual(billRun.batchType)
      expect(result.issuer).toEqual(issuer)
      expect(result.licences).toEqual([])
      expect(result.status).toEqual('start')
      expect(result.createdAt).toEqual(testDate)
      expect(result.updatedAt).toEqual(testDate)

      expect(result.metadata).toBeDefined()
      expect(result.metadata.batch.id).toEqual(billRun.id)
    })
  })
})
