'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers

// Things we need to stub
const AllocateReturnsToChargeElementService = require('../../../../app/services/bill-runs/two-part-tariff/allocate-returns-to-charge-element.service.js')
const FetchLicencesService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-licences.service.js')
const MatchReturnsToChargeElementService = require('../../../../app/services/bill-runs/two-part-tariff/match-returns-to-charge-element.service.js')
const PrepareChargeVersionService = require('../../../../app/services/bill-runs/two-part-tariff/prepare-charge-version.service.js')
const PrepareReturnLogsService = require('../../../../app/services/bill-runs/two-part-tariff/prepare-return-logs.service.js')
const PersistAllocatedLicenceToResultsService = require('../../../../app/services/bill-runs/two-part-tariff/persist-allocated-licence-to-results.service.js')

// Thing under test
const MatchAndAllocateService = require('../../../../app/services/bill-runs/two-part-tariff/match-and-allocate.service.js')

describe('Match And Allocate Service', () => {
  let notifierStub

  const billingPeriods = [
    { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') },
    { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
  ]

  const billRun = {
    regionId: 'ffea25c2-e577-4969-8667-b0eed899230d',
    billingBatchId: '41be6d72-701b-4252-90d5-2d38614b6282'
  }

  beforeEach(() => {
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    const licences = _generateLicences()
    Sinon.stub(FetchLicencesService, 'go').returns(licences)
    Sinon.stub(PrepareReturnLogsService, 'go')
    Sinon.stub(PrepareChargeVersionService, 'go')
    Sinon.stub(MatchReturnsToChargeElementService, 'go').returns()
    Sinon.stub(AllocateReturnsToChargeElementService, 'go')
    Sinon.stub(PersistAllocatedLicenceToResultsService, 'go')
  })

  afterEach(async () => {
    delete global.GlobalNotifier
    Sinon.restore()
  })

  describe('with a given billRun and billingPeriods', () => {
    it('fetches the licences for that bill run', async () => {
      await MatchAndAllocateService.go(billRun, billingPeriods)

      expect(FetchLicencesService.go.called).to.be.true()
    })

    describe('when there are licences to be processed for the billing period', () => {
      it.only('processes the licences for matching and allocating', async () => {
        await MatchAndAllocateService.go(billRun, billingPeriods)

        expect(PrepareReturnLogsService.go.called).to.be.true()
        expect(PrepareChargeVersionService.go.called).to.be.true()
      })

      it('matches and allocated the charge element to return logs', () => {
        
      })

      it('persists the results of matching and allocating', () => {
        
      })

      it('returns the licences all processed', () => {
        
      })
    })
  })
})

function _generateLicences () {
  return {
    id: '2c2f0ab5-4f73-416e-b3f8-5ed19d81bd59',
    startDate: new Date('2022-04-01'),
    endDate: null,
    status: 'current',
    licence: {
      id: 'cee9ff5f-813a-49c7-ba04-c65cfecf67dd',
      licenceRef: '01/128',
      startDate: new Date('2022-01-01'),
      expiredDate: new Date('2024-05-01'),
      lapsedDate: null,
      revokedDate: null
    },
    chargeReferences: [{
      id: 'a86837fa-cf25-42fe-8216-ea8c2d2c939d',
      volume: 6.82,
      description: 'Mineral washing',
      aggregate: 0.562114443,
      s127: 'true',
      chargeCategory: {
        reference: '4.3.41',
        shortDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
        subsistenceCharge: 12000
      },
      chargeElements: [
        {
          id: 'dab91d76-6778-417f-8f2d-9124a270e926',
          description: 'Trickle Irrigation - Direct',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          authorisedAnnualQuantity: 200,
          purpose: {
            id: '4f300bf3-9d6d-44a2-ac76-ce3c02e7e81b',
            legacyId: '420',
            description: 'Spray Irrigation - Storage'
          }
        },
        {
          id: '1a966bd1-dbce-499d-ae94-b1d6ab72f0b2',
          description: 'Trickle Irrigation - Direct',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          authorisedAnnualQuantity: 100,
          purpose: {
            id: '4f300bf3-9d6d-44a2-ac76-ce3c02e7e81b',
            legacyId: '420',
            description: 'Spray Irrigation - Storage'
          }
        }
      ]
    }],
    changeReason: {
      description: 'Strategic review of charges (SRoC)'
    }
  }
}
