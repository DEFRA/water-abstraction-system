'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateReturnLogId } = require('../../../support/helpers/return-log.helper.js')

// Thing under test
const AllocateReturnsToLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/allocate-returns-to-licence.service.js')

describe.only('Allocate Returns to Licence service', () => {
  describe('when there are valid records to process', () => {
    let testLicences

    describe('with a charge element that has been matched to a return with a quantity to allocate', () => {
      beforeEach(() => {
        testLicences = _generateData(false, false, 'completed', true)
      })

      it('correctly allocates the returns and adds the results to the `testLicences` array', () => {
        AllocateReturnsToLicenceService.go(testLicences)

        expect(testLicences[0].returnLogs[0].allocatedQuantity).to.equal(32)
        expect(testLicences[0].returnLogs[0].matched).to.be.true()

        expect(testLicences[0].chargeVersions[0].chargeReferences[0].allocatedQuantity).to.equal(32)

        expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].allocatedQuantity).to.equal(32)

        expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[0].allocatedQuantity).to.equal(32)
        expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[0].returnId).to.equal(testLicences[0].returnLogs[0].id)
        expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[0].reviewReturnResultId).to.equal(testLicences[0].returnLogs[0].reviewReturnResultId)
      })
    })

    describe.only('with a charge element that has matched to a return but with no quantity to allocate', () => {
      // describe('because the return is a nil return', () => {
      //   beforeEach(() => {
      //     testLicences = _generateData(false, true, 'completed', false)
      //   })

      //   it('doesnt allocate any return quantities but marks the return as being matched', () => {
      //     AllocateReturnsToLicenceService.go(testLicences)

      //     expect(testLicences[0].chargeVersions[0].chargeReferences[0].allocatedQuantity).to.equal(0)
      //     expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].allocatedQuantity).to.equal(0)

      //     expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[0].allocatedQuantity).to.equal(0)
      //     expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[0].returnId).to.equal(testLicences[0].returnLogs[0].id)
      //     expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[0].reviewReturnResultId).to.equal(testLicences[0].returnLogs[0].reviewReturnResultId)

      //     expect(testLicences[0].returnLogs[0].allocatedQuantity).to.equal(0)
      //     expect(testLicences[0].returnLogs[0].matched).to.equal(true)
      //   })
      // })

      // describe('because the return status is not complete', () => {
      //   beforeEach(() => {
      //     testLicences = _generateData(false, false, 'received', true)
      //   })
      // })

      // describe('because the return has no returnSubmissionLines', () => {
      //   beforeEach(() => {
      //     testLicences = _generateData(false, false, 'completed', false)
      //   })
      // })

      // describe('because the return is under query', () => {
      //   beforeEach(() => {
      //     testLicences = _generateData(true, false, 'completed', true)
      //   })
      // })

      const scenarios = [
        { args: [false, true, 'completed', false], reason: 'because the return is a nil return' },
        { args: [false, false, 'received', true], reason: 'because the return status is not complete' },
        { args: [false, false, 'completed', false], reason: 'because the return has no returnSubmissionLines' },
        { args: [true, false, 'completed', true], reason: 'because the return is under query' }
      ]

      scenarios.forEach((scenario) => {
        describe(`${scenario.reason}`, () => {
          beforeEach(() => {
            testLicences = _generateData(...scenario.args)
          })

          it('doesnt allocate any return quantities', () => {
            AllocateReturnsToLicenceService.go(testLicences)

            expect(testLicences[0].chargeVersions[0].chargeReferences[0].allocatedQuantity).to.equal(0)
            expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].allocatedQuantity).to.equal(0)

            expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[0].allocatedQuantity).to.equal(0)
            // expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[0].returnId).to.equal(testLicences[0].returnLogs[0].id)
            // expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[0].reviewReturnResultId).to.equal(testLicences[0].returnLogs[0].reviewReturnResultId)

            expect(testLicences[0].returnLogs[0].allocatedQuantity).to.equal(0)
            // expect(testLicences[0].returnLogs[0].matched).to.equal(true)
          })
        })
      })
    })
  })

  describe('when there are NO records to allocate', () => {
    const testLicences = []

    it('does not throw an error', () => {
      expect(() => AllocateReturnsToLicenceService.go(testLicences)).to.not.throw()
    })
  })
})

function _generateData (underQuery, nilReturn, status, submissionLines) {
  // All data not required for the tests has been excluded from the generated data
  const dataToProcess = [
    {
      id: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
      chargeVersions: [
        {
          id: 'aad7de5b-d684-4980-bcb7-e3b631d3036f',
          chargeReferences: [
            {
              id: '4e7f1824-3680-4df0-806f-c6d651ba4771',
              volume: 32,
              chargeElements: [
                {
                  id: '8eac5976-d16c-4818-8bc8-384d958ce863',
                  authorisedAnnualQuantity: 32,
                  purpose: {
                    legacyId: '400'
                  },
                  returnLogs: [
                  ],
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
                  ]
                }
              ]
            }
          ],
          chargePeriod: {
            startDate: new Date('2022-04-01'),
            endDate: new Date('2023-03-31')
          }
        }
      ],
      returnLogs: [
        {
          id: generateReturnLogId(),
          status,
          underQuery,
          purposes: [
            {
              tertiary: {
                code: '400'
              }
            }
          ],
          returnSubmissions: [
            {
              id: 'c081f44e-4ec8-4287-b4f9-ce41c988ff4e',
              nilReturn,
              returnSubmissionLines: [
                {
                  id: '20020dd1-e975-4cd3-b23e-d5b5b88df2f7',
                  startDate: new Date('2022-04-01'),
                  endDate: new Date('2022-04-30'),
                  quantity: 4000,
                  unallocated: 4
                },
                {
                  id: '13d27ac4-9026-49e3-9597-67e3e82e6776',
                  startDate: new Date('2022-05-01'),
                  endDate: new Date('2022-05-31'),
                  quantity: 4000,
                  unallocated: 4
                },
                {
                  id: '90c9c45b-ea09-47bf-afe5-4f6ebb97231f',
                  startDate: new Date('2022-06-01'),
                  endDate: new Date('2022-06-30'),
                  quantity: 4000,
                  unallocated: 4
                },
                {
                  id: 'ab91f66e-6db3-4c60-b308-aeeeee4df7a9',
                  startDate: new Date('2022-07-01'),
                  endDate: new Date('2022-07-31'),
                  quantity: 4000,
                  unallocated: 4
                },
                {
                  id: '319a139f-a565-4047-a39d-dafd3e810b6b',
                  startDate: new Date('2022-08-01'),
                  endDate: new Date('2022-08-31'),
                  quantity: 4000,
                  unallocated: 4
                },
                {
                  id: '43d58ca8-969d-4e1c-8dd3-987460c63576',
                  startDate: new Date('2022-09-01'),
                  endDate: new Date('2022-09-30'),
                  quantity: 4000,
                  unallocated: 4
                },
                {
                  id: '2aa18525-58d3-40e0-a3ea-44b178748b12',
                  startDate: new Date('2022-10-01'),
                  endDate: new Date('2022-10-31'),
                  quantity: 4000,
                  unallocated: 4
                },
                {
                  id: '3683b81e-18a1-433b-948f-1abcb7bf6a83',
                  startDate: new Date('2023-03-01'),
                  endDate: new Date('2023-03-31'),
                  quantity: 4000,
                  unallocated: 4
                }
              ]
            }
          ],
          nilReturn,
          quantity: 32,
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
          matched: false,
          reviewReturnResultId: 'c3f823c9-7875-4251-913c-a2c859049fd9'
        }
      ]
    }
  ]

  // If nilReturn is true then there are no return submission lines
  if (nilReturn || !submissionLines) {
    dataToProcess[0].returnLogs[0].returnSubmissions = []
  }

  return dataToProcess
}

