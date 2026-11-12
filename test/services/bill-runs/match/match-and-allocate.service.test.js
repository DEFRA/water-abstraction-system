// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import GlobalNotifierStub from 'water-abstraction-engine/test/stubs/global-notifier.stub.js'
import * as AllocateReturnsToChargeElementService from '../../../../src/services/bill-runs/match/allocate-returns-to-charge-element.service.js'
import * as DetermineLicenceIssuesService from '../../../../src/services/bill-runs/match/determine-licence-issues.service.js'
import * as FetchLicencesService from '../../../../src/services/bill-runs/match/fetch-licences.service.js'
import * as MatchReturnsToChargeElementService from '../../../../src/services/bill-runs/match/match-returns-to-charge-element.service.js'
import * as PersistAllocatedLicenceToResultsService from '../../../../src/services/bill-runs/match/persist-allocated-licence-to-results.service.js'
import * as PrepareChargeVersionService from '../../../../src/services/bill-runs/match/prepare-charge-version.service.js'
import * as PrepareReturnLogsService from '../../../../src/services/bill-runs/match/prepare-return-logs.service.js'

// Thing under test
import MatchAndAllocateService from '../../../../src/services/bill-runs/match/match-and-allocate.service.js'

describe('Bill Runs - Match - Match And Allocate service', () => {
  let notifierStub
  let licences

  beforeEach(() => {
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub

    vi.spyOn(DetermineLicenceIssuesService, 'default').mockResolvedValue()
    vi.spyOn(AllocateReturnsToChargeElementService, 'default').mockReturnValue()
    vi.spyOn(MatchReturnsToChargeElementService, 'default').mockReturnValue()
    vi.spyOn(PersistAllocatedLicenceToResultsService, 'default').mockResolvedValue()
    vi.spyOn(PrepareChargeVersionService, 'default').mockReturnValue()
    vi.spyOn(PrepareReturnLogsService, 'default').mockResolvedValue()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('with a given billRun and billingPeriods', () => {
    const billingPeriods = [
      { endDate: new Date('2024-03-31'), startDate: new Date('2023-04-01') },
      { endDate: new Date('2023-03-31'), startDate: new Date('2022-04-01') }
    ]

    const billRun = {
      billingBatchId: '41be6d72-701b-4252-90d5-2d38614b6282',
      regionId: 'ffea25c2-e577-4969-8667-b0eed899230d'
    }

    describe('when there are licences to be processed', () => {
      beforeEach(() => {
        licences = _generateLicencesData()

        vi.spyOn(FetchLicencesService, 'default').mockReturnValue(licences)
      })

      describe('and a charge element has a matching return', () => {
        beforeEach(() => {
          const matchingReturns = _generateMatchingReturnsData()

          vi.spyOn(MatchReturnsToChargeElementService, 'default').mockReturnValue(matchingReturns)
        })

        it('processes the licence for matching allocating', async () => {
          await MatchAndAllocateService(billRun, billingPeriods)

          expect(FetchLicencesService.default).toHaveBeenCalled()
          expect(PrepareReturnLogsService.default).toHaveBeenCalled()
          expect(PrepareChargeVersionService.default).toHaveBeenCalled()

          expect(MatchReturnsToChargeElementService.default).toHaveBeenCalled()
          expect(AllocateReturnsToChargeElementService.default).toHaveBeenCalled()

          expect(DetermineLicenceIssuesService.default).toHaveBeenCalled()
          expect(PersistAllocatedLicenceToResultsService.default).toHaveBeenCalled()
        })

        it('returns "true" as there are licences to process', async () => {
          const result = await MatchAndAllocateService(billRun, billingPeriods)

          expect(result).toBe(true)
        })
      })

      describe('and the charge elements do not have matching returns', () => {
        beforeEach(() => {
          vi.spyOn(MatchReturnsToChargeElementService, 'default').mockReturnValue([])
        })

        it('processes the licence for matching but does not call the allocate returns service', async () => {
          await MatchAndAllocateService(billRun, billingPeriods)

          expect(FetchLicencesService.default).toHaveBeenCalled()
          expect(PrepareReturnLogsService.default).toHaveBeenCalled()
          expect(PrepareChargeVersionService.default).toHaveBeenCalled()

          expect(MatchReturnsToChargeElementService.default).toHaveBeenCalled()
          expect(AllocateReturnsToChargeElementService.default).not.toHaveBeenCalled()

          expect(DetermineLicenceIssuesService.default).toHaveBeenCalled()
          expect(PersistAllocatedLicenceToResultsService.default).toHaveBeenCalled()
        })

        it('allocates the authorised quantities to the elements up to the references authorised quantity', async () => {
          await MatchAndAllocateService(billRun, billingPeriods)

          const { chargeVersions } = DetermineLicenceIssuesService.default.mock.calls[0][0]
          const chargeReference = chargeVersions[0].chargeReferences[0]

          expect(chargeReference.allocatedQuantity).toEqual(32)
          expect(chargeReference.chargeElements[0].allocatedQuantity).toEqual(30)
          expect(chargeReference.chargeElements[1].allocatedQuantity).toEqual(2)
        })

        it('returns "true" as there are licences to process', async () => {
          const result = await MatchAndAllocateService(billRun, billingPeriods)

          expect(result).toBe(true)
        })
      })
    })

    describe('when there are no licences to be processed', () => {
      beforeEach(() => {
        vi.spyOn(FetchLicencesService, 'default').mockReturnValue([])
      })

      it('calls the fetchLicencesService', async () => {
        await MatchAndAllocateService(billRun, billingPeriods)

        expect(FetchLicencesService.default).toHaveBeenCalled()
      })

      it('does not process the licences', async () => {
        await MatchAndAllocateService(billRun, billingPeriods)

        expect(PrepareReturnLogsService.default).not.toHaveBeenCalled()
        expect(PrepareChargeVersionService.default).not.toHaveBeenCalled()
        expect(MatchReturnsToChargeElementService.default).not.toHaveBeenCalled()
        expect(AllocateReturnsToChargeElementService.default).not.toHaveBeenCalled()
        expect(DetermineLicenceIssuesService.default).not.toHaveBeenCalled()
        expect(PersistAllocatedLicenceToResultsService.default).not.toHaveBeenCalled()
      })

      it('returns "false" as there are no licences to process', async () => {
        const result = await MatchAndAllocateService(billRun, billingPeriods)

        expect(result).toBe(false)
      })
    })
  })
})

function _generateMatchingReturnsData() {
  return [
    {
      abstractionOutsidePeriod: true,
      abstractionPeriods: [
        {
          endDate: new Date('2022-10-31'),
          startDate: new Date('2022-04-01')
        },
        {
          endDate: new Date('2023-03-31'),
          startDate: new Date('2023-03-01')
        }
      ],
      allocatedQuantity: 0,
      description: 'DRAINS ETC-DEEPING FEN AND OTHER LINKED SITES',
      dueDate: new Date('2023-04-28'),
      endDate: new Date('2023-03-31'),
      id: 'v1:1:5/31/14/*S/0116A:10021668:2022-04-01:2023-03-31',
      issues: false,
      matched: true,
      nilReturn: false,
      periodEndDay: 31,
      periodEndMonth: 10,
      periodStartDay: 1,
      periodStartMonth: 3,
      purposes: [
        {
          alias: 'Spray Irrigation - Direct',
          primary: { code: 'A', description: 'Agriculture' },
          secondary: { code: 'AGR', description: 'General Agriculture' },
          tertiary: { code: '400', description: 'Spray Irrigation - Direct' }
        }
      ],
      quantity: 0.000263,
      receivedDate: new Date('2024-01-10'),
      returnReference: 10021668,
      returnSubmissions: [
        {
          id: '1313d4f1-0fe8-4dfa-b18d-3faddedcc18f',
          nilReturn: false,
          returnSubmissionLines: [
            {
              endDate: new Date('2022-04-30'),
              id: 'e828b761-0fe0-4d57-8fcd-fa892ecc213e',
              quantity: 0.025,
              startDate: new Date('2022-04-01'),
              unallocated: 0.000025
            }
          ]
        }
      ],
      startDate: new Date('2022-04-01'),
      status: 'completed',
      underQuery: false
    }
  ]
}

function _generateLicencesData() {
  return [
    {
      chargeVersions: [
        {
          changeReason: {
            description: 'Strategic review of charges (SRoC)'
          },
          chargeReferences: [
            {
              aggregate: null,
              chargeCategory: {
                reference: '4.6.12',
                shortDescription:
                  'High loss, non-tidal, restricted water, greater than 15 up to and including 50 ML/yr, Tier 2 model',
                subsistenceCharge: 68400
              },
              chargeElements: [
                {
                  abstractionPeriodEndDay: 31,
                  abstractionPeriodEndMonth: 10,
                  abstractionPeriodStartDay: 1,
                  abstractionPeriodStartMonth: 3,
                  authorisedAnnualQuantity: 30,
                  description:
                    'Spray irrigation at Welland and Deepings Internal Drainage Board drains and the River Glen at West Pinchbeck',
                  id: '8eac5976-d16c-4818-8bc8-384d958ce863',
                  purpose: {
                    description: 'Spray Irrigation - Direct',
                    id: 'f3872a42-b91b-4c58-887a-ef09dda686fd',
                    legacyId: '400'
                  }
                },
                {
                  abstractionPeriodEndDay: 31,
                  abstractionPeriodEndMonth: 10,
                  abstractionPeriodStartDay: 1,
                  abstractionPeriodStartMonth: 3,
                  authorisedAnnualQuantity: 30,
                  description:
                    'Spray irrigation at Welland and Deepings Internal Drainage Board drains and the River Glen at West Pinchbeck',
                  id: '5713d337-0d52-4d7f-8ecc-0e77d8d63444',
                  purpose: {
                    description: 'Spray Irrigation - Storage',
                    id: '4c1ecee4-a1a3-41fe-8004-ae6a27ef2207',
                    legacyId: '420'
                  }
                }
              ],
              description: 'Example 1',
              id: '4e7f1824-3680-4df0-806f-c6d651ba4771',
              s127: 'true',
              volume: 32
            }
          ],
          endDate: null,
          id: 'aad7de5b-d684-4980-bcb7-e3b631d3036f',
          licence: {
            expiredDate: null,
            id: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
            lapsedDate: null,
            licenceRef: '5/31/14/*S/0116A',
            revokedDate: null,
            startDate: new Date('1966-02-01')
          },
          startDate: new Date('2022-04-01'),
          status: 'current'
        }
      ],
      expiredDate: null,
      id: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
      lapsedDate: null,
      licenceRef: '5/31/14/*S/0116A',
      revokedDate: null,
      startDate: new Date('1966-02-01')
    }
  ]
}
