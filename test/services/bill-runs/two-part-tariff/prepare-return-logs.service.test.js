'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Things we need to stub
const FetchReturnLogsForLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-return-logs-for-licence.service.js')

// Thing under test
const PrepareReturnLogService = require('../../../../app/services/bill-runs/two-part-tariff/prepare-return-logs.service.js')

describe('Prepare Return Logs Service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  afterEach(() => {
    Sinon.restore()
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

          Sinon.stub(FetchReturnLogsForLicenceService, 'go').resolves([returnLog])
        })

        it('preps the returns correctly', async () => {
          await PrepareReturnLogService.go(licence, billingPeriod)

          expect(licence.returnLogs[0]).to.equal({
            id: 'v1:1:01/977:14959864:2022-04-01:2023-03-31',
            returnReference: '14959864',
            description: 'The Description',
            startDate: new Date('2022-04-01'),
            endDate: new Date('2023-03-31'),
            receivedDate: new Date('2023-04-12'),
            dueDate: new Date('2023-04-28'),
            status: 'completed',
            underQuery: false,
            periodStartDay: 1,
            periodStartMonth: 4,
            periodEndDay: 31,
            periodEndMonth: 3,
            returnSubmissions: [
              {
                id: 'daac9a37-377a-4c8a-a44c-8b5bf1fbc9eb',
                nilReturn: false,
                returnSubmissionLines: [
                  {
                    id: '7230448c-ec31-45d6-b14d-12c999bb27ec',
                    startDate: new Date('2022-05-01'),
                    endDate: new Date('2022-05-07'),
                    quantity: 1234,
                    unallocated: 1.234
                  },
                  {
                    id: '383e0969-760b-4cb6-8d95-d4e93f812a2e',
                    startDate: new Date('2022-05-08'),
                    endDate: new Date('2022-05-14'),
                    quantity: 5678,
                    unallocated: 5.678
                  }
                ]
              }
            ],
            nilReturn: false,
            quantity: 6.912,
            allocatedQuantity: 0,
            abstractionPeriods: [
              {
                startDate: new Date('2022-04-01'),
                endDate: new Date('2023-03-31')
              }
            ],
            abstractionOutsidePeriod: false,
            matched: false
          })
        })
      })

      describe('that have submission lines outside the abstraction period', () => {
        beforeEach(async () => {
          const returnLog = _testReturnLog()

          returnLog.returnSubmissions[0].returnSubmissionLines[0].startDate = new Date('2023-04-05')

          Sinon.stub(FetchReturnLogsForLicenceService, 'go').resolves([returnLog])
        })

        it('flags the return as outside the abstraction period', async () => {
          await PrepareReturnLogService.go(licence, billingPeriod)

          expect(licence.returnLogs[0].abstractionOutsidePeriod).to.be.true()
        })
      })

      describe('that is a nil return', () => {
        beforeEach(async () => {
          const returnLog = _testReturnLog()

          returnLog.returnSubmissions[0].nilReturn = true

          Sinon.stub(FetchReturnLogsForLicenceService, 'go').resolves([returnLog])
        })

        it('flags the return as a nil return', async () => {
          await PrepareReturnLogService.go(licence, billingPeriod)

          expect(licence.returnLogs[0].nilReturn).to.be.true()
        })
      })
    })

    describe('when no matching returns exist', () => {
      beforeEach(async () => {
        Sinon.stub(FetchReturnLogsForLicenceService, 'go').resolves([])
      })

      it('assigns no return logs to the licence', async () => {
        await PrepareReturnLogService.go(licence, billingPeriod)

        expect(licence.returnLogs).to.be.empty()
      })
    })
  })
})

function _testLicence () {
  return {
    id: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
    licenceRef: '5/31/14/*S/0116A',
    startDate: new Date('1966-02-01T00:00:00.000Z'),
    expiredDate: null,
    lapsedDate: null,
    revokedDate: null,
    chargeVersions: [
      {
        id: 'aad7de5b-d684-4980-bcb7-e3b631d3036f',
        startDate: new Date('2022-04-01'),
        endDate: null,
        status: 'current',
        licence: {
          id: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
          licenceRef: '5/31/14/*S/0116A',
          startDate: new Date('1966-02-01T00:00:00.000Z'),
          expiredDate: null,
          lapsedDate: null,
          revokedDate: null
        },
        chargeReferences: [
          {
            id: '4e7f1824-3680-4df0-806f-c6d651ba4771',
            volume: 32,
            description: 'Example',
            aggregate: null,
            s127: 'true',
            chargeCategory: {
              reference: '4.5.12',
              shortDescription: 'Medium loss, non-tidal, restricted water, greater than 25 up to and including 83 ML/yr, Tier 2 model',
              subsistenceCharge: 68400
            },
            chargeElements: [
              {
                id: '8eac5976-d16c-4818-8bc8-384d958ce863',
                description: 'Spray irrigation',
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 3,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 10,
                authorisedAnnualQuantity: 32,
                purpose: {
                  id: 'f3872a42-b91b-4c58-887a-ef09dda686fd',
                  legacyId: '400',
                  description: 'Spray Irrigation - Direct'
                }
              }
            ]
          },
          {
            id: '6e7f1824-3680-4df0-806f-c6d651ba4771',
            volume: 32,
            description: 'Second Reference',
            aggregate: null,
            s127: 'true',
            chargeCategory: {
              reference: '4.5.12',
              shortDescription: 'Medium loss, non-tidal, restricted water, greater than 25 up to and including 83 ML/yr, Tier 2 model',
              subsistenceCharge: 70000
            },
            chargeElements: [
              {
                id: '8eac5976-d16c-4818-8bc8-384d958ce863',
                description: 'Spray irrigation',
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 3,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 10,
                authorisedAnnualQuantity: 32,
                purpose: {
                  id: 'f3872a42-b91b-4c58-887a-ef09dda686fd',
                  legacyId: '400',
                  description: 'Spray Irrigation - Direct'
                }
              }
            ]
          }
        ]
      }
    ]
  }
}

function _testReturnLog () {
  return {
    id: 'v1:1:01/977:14959864:2022-04-01:2023-03-31',
    returnReference: '14959864',
    description: 'The Description',
    startDate: new Date('2022-04-01T00:00:00.000Z'),
    endDate: new Date('2023-03-31T00:00:00.000Z'),
    receivedDate: new Date('2023-04-12T00:00:00.000Z'),
    dueDate: new Date('2023-04-28T00:00:00.000Z'),
    status: 'completed',
    underQuery: false,
    periodStartDay: 1,
    periodStartMonth: 4,
    periodEndDay: 31,
    periodEndMonth: 3,
    returnSubmissions: [
      {
        id: 'daac9a37-377a-4c8a-a44c-8b5bf1fbc9eb',
        nilReturn: false,
        returnSubmissionLines: [
          {
            id: '7230448c-ec31-45d6-b14d-12c999bb27ec',
            startDate: new Date('2022-05-01'),
            endDate: new Date('2022-05-07'),
            quantity: 1234
          },
          {
            id: '383e0969-760b-4cb6-8d95-d4e93f812a2e',
            startDate: new Date('2022-05-08'),
            endDate: new Date('2022-05-14'),
            quantity: 5678
          }
        ]
      }
    ]
  }
}
