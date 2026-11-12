// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import * as FetchReturnLogsForLicenceService from '../../../../src/services/bill-runs/match/fetch-return-logs-for-licence.service.js'

// Thing under test
import PrepareReturnLogService from '../../../../src/services/bill-runs/match/prepare-return-logs.service.js'

describe('Prepare Return Logs Service', () => {
  const billingPeriod = {
    endDate: new Date('2023-03-31'),
    startDate: new Date('2022-04-01')
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('for a licence', () => {
    let licence

    beforeEach(async () => {
      licence = _testLicence()
    })

    describe('when matching returns exist', () => {
      describe('that have no issues', () => {
        beforeEach(async () => {
          const returnLog = _testReturnLog()

          vi.spyOn(FetchReturnLogsForLicenceService, 'default').mockResolvedValue([returnLog])
        })

        it('preps the returns correctly', async () => {
          await PrepareReturnLogService(licence, billingPeriod)

          expect(licence.returnLogs[0]).toEqual({
            abstractionOutsidePeriod: false,
            abstractionPeriods: [
              {
                endDate: new Date('2023-03-31'),
                startDate: new Date('2022-04-01')
              }
            ],
            allocatedQuantity: 0,
            description: 'The Description',
            dueDate: new Date('2023-04-28'),
            endDate: new Date('2023-03-31'),
            id: 'v1:1:01/977:14959864:2022-04-01:2023-03-31',
            matched: false,
            nilReturn: false,
            periodEndDay: 31,
            periodEndMonth: 3,
            periodStartDay: 1,
            periodStartMonth: 4,
            quantity: 6.912,
            receivedDate: new Date('2023-04-12'),
            returnReference: 14959864,
            returnSubmissions: [
              {
                id: 'daac9a37-377a-4c8a-a44c-8b5bf1fbc9eb',
                nilReturn: false,
                returnSubmissionLines: [
                  {
                    endDate: new Date('2022-05-07'),
                    id: '7230448c-ec31-45d6-b14d-12c999bb27ec',
                    quantity: 1234,
                    startDate: new Date('2022-05-01'),
                    unallocated: 1.234
                  },
                  {
                    endDate: new Date('2022-05-14'),
                    id: '383e0969-760b-4cb6-8d95-d4e93f812a2e',
                    quantity: 5678,
                    startDate: new Date('2022-05-08'),
                    unallocated: 5.678
                  }
                ]
              }
            ],
            startDate: new Date('2022-04-01'),
            status: 'completed',
            underQuery: false
          })
        })
      })

      describe('that have submission lines outside the abstraction period', () => {
        beforeEach(async () => {
          const returnLog = _testReturnLog()

          returnLog.returnSubmissions[0].returnSubmissionLines[0].startDate = new Date('2023-04-05')

          vi.spyOn(FetchReturnLogsForLicenceService, 'default').mockResolvedValue([returnLog])
        })

        it('flags the return as outside the abstraction period', async () => {
          await PrepareReturnLogService(licence, billingPeriod)

          expect(licence.returnLogs[0].abstractionOutsidePeriod).toBe(true)
        })
      })

      describe('that is a nil return', () => {
        beforeEach(async () => {
          const returnLog = _testReturnLog()

          returnLog.returnSubmissions[0].nilReturn = true

          vi.spyOn(FetchReturnLogsForLicenceService, 'default').mockResolvedValue([returnLog])
        })

        it('flags the return as a nil return', async () => {
          await PrepareReturnLogService(licence, billingPeriod)

          expect(licence.returnLogs[0].nilReturn).toBe(true)
        })
      })
    })

    describe('when no matching returns exist', () => {
      beforeEach(async () => {
        vi.spyOn(FetchReturnLogsForLicenceService, 'default').mockResolvedValue([])
      })

      it('assigns no return logs to the licence', async () => {
        await PrepareReturnLogService(licence, billingPeriod)

        expect(licence.returnLogs).toHaveLength(0)
      })
    })
  })
})

function _testLicence() {
  return {
    chargeVersions: [
      {
        chargeReferences: [
          {
            aggregate: null,
            chargeCategory: {
              reference: '4.5.12',
              shortDescription:
                'Medium loss, non-tidal, restricted water, greater than 25 up to and including 83 ML/yr, Tier 2 model',
              subsistenceCharge: 68400
            },
            chargeElements: [
              {
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 10,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 3,
                authorisedAnnualQuantity: 32,
                description: 'Spray irrigation',
                id: '8eac5976-d16c-4818-8bc8-384d958ce863',
                purpose: {
                  description: 'Spray Irrigation - Direct',
                  id: 'f3872a42-b91b-4c58-887a-ef09dda686fd',
                  legacyId: '400'
                }
              }
            ],
            description: 'Example',
            id: '4e7f1824-3680-4df0-806f-c6d651ba4771',
            s127: 'true',
            volume: 32
          },
          {
            aggregate: null,
            chargeCategory: {
              reference: '4.5.12',
              shortDescription:
                'Medium loss, non-tidal, restricted water, greater than 25 up to and including 83 ML/yr, Tier 2 model',
              subsistenceCharge: 70000
            },
            chargeElements: [
              {
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 10,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 3,
                authorisedAnnualQuantity: 32,
                description: 'Spray irrigation',
                id: '8eac5976-d16c-4818-8bc8-384d958ce863',
                purpose: {
                  description: 'Spray Irrigation - Direct',
                  id: 'f3872a42-b91b-4c58-887a-ef09dda686fd',
                  legacyId: '400'
                }
              }
            ],
            description: 'Second Reference',
            id: '6e7f1824-3680-4df0-806f-c6d651ba4771',
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
          startDate: new Date('1966-02-01T00:00:00.000Z')
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
    startDate: new Date('1966-02-01T00:00:00.000Z')
  }
}

function _testReturnLog() {
  return {
    description: 'The Description',
    dueDate: new Date('2023-04-28T00:00:00.000Z'),
    endDate: new Date('2023-03-31T00:00:00.000Z'),
    id: 'v1:1:01/977:14959864:2022-04-01:2023-03-31',
    periodEndDay: 31,
    periodEndMonth: 3,
    periodStartDay: 1,
    periodStartMonth: 4,
    receivedDate: new Date('2023-04-12T00:00:00.000Z'),
    returnReference: 14959864,
    returnSubmissions: [
      {
        id: 'daac9a37-377a-4c8a-a44c-8b5bf1fbc9eb',
        nilReturn: false,
        returnSubmissionLines: [
          {
            endDate: new Date('2022-05-07'),
            id: '7230448c-ec31-45d6-b14d-12c999bb27ec',
            quantity: 1234,
            startDate: new Date('2022-05-01')
          },
          {
            endDate: new Date('2022-05-14'),
            id: '383e0969-760b-4cb6-8d95-d4e93f812a2e',
            quantity: 5678,
            startDate: new Date('2022-05-08')
          }
        ]
      }
    ],
    startDate: new Date('2022-04-01T00:00:00.000Z'),
    status: 'completed',
    underQuery: false
  }
}
