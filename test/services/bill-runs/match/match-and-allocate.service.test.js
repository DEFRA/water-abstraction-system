'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const AllocateReturnsToChargeElementService = require('../../../../app/services/bill-runs/match/allocate-returns-to-charge-element.service.js')
const DetermineLicenceIssuesService = require('../../../../app/services/bill-runs/match/determine-licence-issues.service.js')
const FetchLicencesService = require('../../../../app/services/bill-runs/match/fetch-licences.service.js')
const MatchReturnsToChargeElementService = require('../../../../app/services/bill-runs/match/match-returns-to-charge-element.service.js')
const PrepareChargeVersionService = require('../../../../app/services/bill-runs/match/prepare-charge-version.service.js')
const PrepareReturnLogsService = require('../../../../app/services/bill-runs/match/prepare-return-logs.service.js')
const PersistAllocatedLicenceToResultsService = require('../../../../app/services/bill-runs/match/persist-allocated-licence-to-results.service.js')

// Thing under test
const MatchAndAllocateService = require('../../../../app/services/bill-runs/match/match-and-allocate.service.js')

describe('Bill Runs - Match - Match And Allocate service', () => {
  let determineLicenceIssuesServiceStub
  let notifierStub
  let licences

  beforeEach(() => {
    notifierStub = { omg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(async () => {
    delete global.GlobalNotifier
    Sinon.restore()
  })

  describe('with a given billRun and billingPeriods', () => {
    const billingPeriods = [
      { startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') },
      { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
    ]

    const billRun = {
      regionId: 'ffea25c2-e577-4969-8667-b0eed899230d',
      billingBatchId: '41be6d72-701b-4252-90d5-2d38614b6282'
    }

    describe('when there are licences to be processed', () => {
      beforeEach(() => {
        licences = _generateLicencesData()
        determineLicenceIssuesServiceStub = Sinon.stub(DetermineLicenceIssuesService, 'go')

        Sinon.stub(AllocateReturnsToChargeElementService, 'go')
        Sinon.stub(FetchLicencesService, 'go').returns(licences)
        Sinon.stub(PersistAllocatedLicenceToResultsService, 'go')
        Sinon.stub(PrepareChargeVersionService, 'go')
        Sinon.stub(PrepareReturnLogsService, 'go')
      })

      describe('and a charge element has a matching return', () => {
        beforeEach(() => {
          const matchingReturns = _generateMatchingReturnsData()

          Sinon.stub(MatchReturnsToChargeElementService, 'go').returns(matchingReturns)
        })

        it('processes the licence for matching allocating', async () => {
          await MatchAndAllocateService.go(billRun, billingPeriods)

          expect(FetchLicencesService.go.called).to.be.true()
          expect(PrepareReturnLogsService.go.called).to.be.true()
          expect(PrepareChargeVersionService.go.called).to.be.true()

          expect(MatchReturnsToChargeElementService.go.called).to.be.true()
          expect(AllocateReturnsToChargeElementService.go.called).to.be.true()

          expect(DetermineLicenceIssuesService.go.called).to.be.true()
          expect(PersistAllocatedLicenceToResultsService.go.called).to.be.true()
        })

        it('returns "true" as there are licences to process', async () => {
          const result = await MatchAndAllocateService.go(billRun, billingPeriods)

          expect(result).to.be.true()
        })
      })

      describe('and the charge elements do not have matching returns', () => {
        beforeEach(() => {
          Sinon.stub(MatchReturnsToChargeElementService, 'go').returns([])
        })

        it('processes the licence for matching but does not call the allocate returns service', async () => {
          await MatchAndAllocateService.go(billRun, billingPeriods)

          expect(FetchLicencesService.go.called).to.be.true()
          expect(PrepareReturnLogsService.go.called).to.be.true()
          expect(PrepareChargeVersionService.go.called).to.be.true()

          expect(MatchReturnsToChargeElementService.go.called).to.be.true()
          expect(AllocateReturnsToChargeElementService.go.called).to.be.false()

          expect(DetermineLicenceIssuesService.go.called).to.be.true()
          expect(PersistAllocatedLicenceToResultsService.go.called).to.be.true()
        })

        it('allocates the authorised quantities to the elements up to the references authorised quantity', async () => {
          await MatchAndAllocateService.go(billRun, billingPeriods)

          const { chargeVersions } = determineLicenceIssuesServiceStub.firstCall.args[0]
          const chargeReference = chargeVersions[0].chargeReferences[0]

          expect(chargeReference.allocatedQuantity).to.equal(32)
          expect(chargeReference.chargeElements[0].allocatedQuantity).to.equal(30)
          expect(chargeReference.chargeElements[1].allocatedQuantity).to.equal(2)
        })

        it('returns "true" as there are licences to process', async () => {
          const result = await MatchAndAllocateService.go(billRun, billingPeriods)

          expect(result).to.be.true()
        })
      })
    })

    describe('when there are no licences to be processed', () => {
      beforeEach(() => {
        Sinon.stub(FetchLicencesService, 'go').returns([])
        Sinon.stub(PrepareReturnLogsService, 'go')
        Sinon.stub(PrepareChargeVersionService, 'go')
        Sinon.stub(MatchReturnsToChargeElementService, 'go')
        Sinon.stub(AllocateReturnsToChargeElementService, 'go')
        Sinon.stub(DetermineLicenceIssuesService, 'go')
        Sinon.stub(PersistAllocatedLicenceToResultsService, 'go')
      })

      it('calls the fetchLicencesService', async () => {
        await MatchAndAllocateService.go(billRun, billingPeriods)

        expect(FetchLicencesService.go.called).to.be.true()
      })

      it('does not process the licences', async () => {
        await MatchAndAllocateService.go(billRun, billingPeriods)

        expect(PrepareReturnLogsService.go.called).to.be.false()
        expect(PrepareChargeVersionService.go.called).to.be.false()
        expect(MatchReturnsToChargeElementService.go.called).to.be.false()
        expect(AllocateReturnsToChargeElementService.go.called).to.be.false()
        expect(DetermineLicenceIssuesService.go.called).to.be.false()
        expect(PersistAllocatedLicenceToResultsService.go.called).to.be.false()
      })

      it('returns "false" as there are no licences to process', async () => {
        const result = await MatchAndAllocateService.go(billRun, billingPeriods)

        expect(result).to.be.false()
      })
    })
  })
})

function _generateMatchingReturnsData() {
  return [
    {
      id: 'v1:1:5/31/14/*S/0116A:10021668:2022-04-01:2023-03-31',
      returnReference: '10021668',
      description: 'DRAINS ETC-DEEPING FEN AND OTHER LINKED SITES',
      startDate: new Date('2022-04-01'),
      endDate: new Date('2023-03-31'),
      receivedDate: new Date('2024-01-10'),
      dueDate: new Date('2023-04-28'),
      status: 'completed',
      underQuery: false,
      periodStartDay: 1,
      periodStartMonth: 3,
      periodEndDay: 31,
      periodEndMonth: 10,
      purposes: [
        {
          alias: 'Spray Irrigation - Direct',
          primary: { code: 'A', description: 'Agriculture' },
          tertiary: { code: '400', description: 'Spray Irrigation - Direct' },
          secondary: { code: 'AGR', description: 'General Agriculture' }
        }
      ],
      returnSubmissions: [
        {
          id: '1313d4f1-0fe8-4dfa-b18d-3faddedcc18f',
          nilReturn: false,
          returnSubmissionLines: [
            {
              id: 'e828b761-0fe0-4d57-8fcd-fa892ecc213e',
              startDate: new Date('2022-04-01'),
              endDate: new Date('2022-04-30'),
              quantity: 0.025,
              unallocated: 0.000025
            }
          ]
        }
      ],
      nilReturn: false,
      quantity: 0.000263,
      allocatedQuantity: 0,
      abstractionPeriods: [
        {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2022-10-31')
        },
        {
          startDate: new Date('2023-03-01'),
          endDate: new Date('2023-03-31')
        }
      ],
      abstractionOutsidePeriod: true,
      matched: true,
      issues: false
    }
  ]
}

function _generateLicencesData() {
  return [
    {
      id: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
      licenceRef: '5/31/14/*S/0116A',
      startDate: new Date('1966-02-01'),
      expiredDate: null,
      lapsedDate: null,
      revokedDate: null,
      chargeVersions: [
        {
          id: 'aad7de5b-d684-4980-bcb7-e3b631d3036f',
          startDate: new Date('2022-04-01'),
          endDate: null,
          status: 'current',
          changeReason: {
            description: 'Strategic review of charges (SRoC)'
          },
          licence: {
            id: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
            licenceRef: '5/31/14/*S/0116A',
            startDate: new Date('1966-02-01'),
            expiredDate: null,
            lapsedDate: null,
            revokedDate: null
          },
          chargeReferences: [
            {
              id: '4e7f1824-3680-4df0-806f-c6d651ba4771',
              volume: 32,
              description: 'Example 1',
              aggregate: null,
              s127: 'true',
              chargeCategory: {
                reference: '4.6.12',
                shortDescription:
                  'High loss, non-tidal, restricted water, greater than 15 up to and including 50 ML/yr, Tier 2 model',
                subsistenceCharge: 68400
              },
              chargeElements: [
                {
                  id: '8eac5976-d16c-4818-8bc8-384d958ce863',
                  description:
                    'Spray irrigation at Welland and Deepings Internal Drainage Board drains and the River Glen at West Pinchbeck',
                  abstractionPeriodStartDay: 1,
                  abstractionPeriodStartMonth: 3,
                  abstractionPeriodEndDay: 31,
                  abstractionPeriodEndMonth: 10,
                  authorisedAnnualQuantity: 30,
                  purpose: {
                    id: 'f3872a42-b91b-4c58-887a-ef09dda686fd',
                    legacyId: '400',
                    description: 'Spray Irrigation - Direct'
                  }
                },
                {
                  id: '5713d337-0d52-4d7f-8ecc-0e77d8d63444',
                  description:
                    'Spray irrigation at Welland and Deepings Internal Drainage Board drains and the River Glen at West Pinchbeck',
                  abstractionPeriodStartDay: 1,
                  abstractionPeriodStartMonth: 3,
                  abstractionPeriodEndDay: 31,
                  abstractionPeriodEndMonth: 10,
                  authorisedAnnualQuantity: 30,
                  purpose: {
                    id: '4c1ecee4-a1a3-41fe-8004-ae6a27ef2207',
                    legacyId: '420',
                    description: 'Spray Irrigation - Storage'
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
