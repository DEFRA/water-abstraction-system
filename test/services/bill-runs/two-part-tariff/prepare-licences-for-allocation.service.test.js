'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FetchReturnLogsForLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-return-logs-for-licence.service.js')

// Thing under test
const PrepareLicencesForAllocationService = require('../../../../app/services/bill-runs/two-part-tariff/prepare-licences-for-allocation.service.js')

describe('Prepare Licences For Allocation Service', () => {
  describe('when given a licence and billing period', () => {
    let licence
    let billingPeriod
    let returnLogs

    beforeEach(async () => {
      // Setting up our licence object with charge versions, charge references and charge elements hanging off it
      licence = [{
        licenceId: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
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
              licenceId: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
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
      }]

      returnLogs = [
        {
          id: 'v1:1:01/977:14959864:2022-04-01:2023-03-31',
          returnRequirement: '14959864',
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
      ]

      // Stubbing the FetchReturnLogsForLicenceService to return our licence return logs
      Sinon.stub(FetchReturnLogsForLicenceService, 'go').resolves(returnLogs)

      billingPeriod = {
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31')
      }
    })

    afterEach(() => {
      Sinon.restore()
    })

    describe('fetches the relevant returns for that licence', () => {
      describe('and prepares the returns for that licence', () => {
        it('adds the abstraction period to the individual return', async () => {
          const abstractionPeriods = [
            {
              startDate: new Date('2022-04-01'),
              endDate: new Date('2023-03-31')
            }
          ]

          await PrepareLicencesForAllocationService.go(licence, billingPeriod)

          expect(licence[0].returnLogs[0].abstractionPeriods).to.equal(abstractionPeriods)
        })

        it('flags the return if abstraction has happened outside the abstraction period', async () => {
          returnLogs[0].returnSubmissions[0].returnSubmissionLines[0].startDate = new Date('2023-04-05')

          await PrepareLicencesForAllocationService.go(licence, billingPeriod)

          expect(licence[0].returnLogs[0].abstractionOutsidePeriod).to.be.true()
        })

        it('flags if the return is a nil-return', async () => {
          returnLogs[0].returnSubmissions[0].nilReturn = true

          await PrepareLicencesForAllocationService.go(licence, billingPeriod)

          expect(licence[0].returnLogs[0].nilReturn).to.be.true()
        })

        it('sets the allocated quantity on the return to 0', async () => {
          await PrepareLicencesForAllocationService.go(licence, billingPeriod)

          expect(licence[0].returnLogs[0].allocatedQuantity).to.equal(0)
        })

        it('sets `matched` on the return to false', async () => {
          await PrepareLicencesForAllocationService.go(licence, billingPeriod)

          expect(licence[0].returnLogs[0].matched).to.be.false()
        })

        it('sets the quantity on the return to the sum of the returns lines', async () => {
          await PrepareLicencesForAllocationService.go(licence, billingPeriod)

          expect(licence[0].returnLogs[0].quantity).to.equal(6.912)
        })
      })
    })

    // it('sorts the charge references by subsistence charge', () => {

    // })

    // it('determines the charge period for each charge version', () => {

    // })

    // describe('prepares all the charge elements for that licence', () => {
    //   it('does not prepare a charge element that has a charge version with no start or end date', () => {

    //   })

    //   it('sets the charge elements return logs to an empty array', () => {

    //   })

    //   it('sets the chare elements allocated quantity to 0', () => {

    //   })
    //   it('sets the charge elements abstraction periods', () => {

    //   })
    // })
  })
})
