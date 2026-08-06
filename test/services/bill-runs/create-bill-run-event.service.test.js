// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import BillRunHelper from 'water-abstraction-engine/test/helpers/bill-run.helper.js'
import BillRunModel from 'water-abstraction-engine/models/bill-run.model.js'
import EventModel from 'water-abstraction-engine/models/event.model.js'
import RegionHelper from 'water-abstraction-engine/test/helpers/region.helper.js'

// Thing under test
import CreateBillRunEventService from '../../../src/services/bill-runs/create-bill-run-event.service.js'

describe('Create Bill Run Event service', () => {
  let testDate

  beforeEach(async () => {
    testDate = new Date(2015, 9, 21, 20, 31, 57)
    vi.useFakeTimers({ now: testDate, toFake: ['Date'] })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
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
      const result = await CreateBillRunEventService(billRun, issuer)

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
