'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const { generateReturnLogId } = require('../../../support/helpers/return-log.helper.js')

// Thing under test
const AllocateReturnsToChargeElementService = require('../../../../app/services/bill-runs/two-part-tariff/allocate-returns-to-licence.service.js')

describe.only('Allocate Returns to Charge Element Service', () => {
  describe('when there are valid records to process', () => {
    let testLicences
    let chargeElement
    let chargeVersion
    let chargeReference
    let matchingReturns

    describe('with a charge element that has been matched to a return with a quantity to allocate', () => {
      beforeEach(() => {
        testLicences = _generateLicenceData()
        chargeVersion = testLicences.chargeVersion[0]
        chargeReference = testLicences.chargeVersion[0].chargeReference[0]
        chargeElement = testLicences.chargeVersion[0].chargeReference[0].chargeElement[0]

        matchingReturns = _generateMatchingReturns()
      })

      it('correctly allocates the returns and adds the results to the `testLicences` array', () => {
        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargeVersion, chargeReference)

        expect(testLicences[0].returnLogs[0].allocatedQuantity).to.equal(32)
        expect(testLicences[0].returnLogs[0].matched).to.be.true()

        expect(testLicences[0].chargeVersions[0].chargeReferences[0].allocatedQuantity).to.equal(32)

        expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].allocatedQuantity).to.equal(32)

        expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[0].allocatedQuantity).to.equal(32)
        expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[0].returnId).to.equal(testLicences[0].returnLogs[0].id)
        expect(testLicences[0].chargeVersions[0].chargeReferences[0].chargeElements[0].returnLogs[0].reviewReturnResultId).to.equal(testLicences[0].returnLogs[0].reviewReturnResultId)
      })
    })
  })

  describe('when there are NO records to allocate', () => {
    const testLicences = []

    it('does not throw an error', () => {
      expect(() => AllocateReturnsToChargeElementService.go(testLicences)).to.not.throw()
    })
  })
})

function _generateMatchingReturns () {
  return [
    {
      id: 'v1:1:5/31/14/*S/0116A:10021668:2022-04-01:2023-03-31',
      returnRequirement: '10021668',
      description: 'DRAINS ETC-DEEPING FEN AND OTHER LINKED SITES',
      startDate: new Date('2022-04-01'),
      endDate: new Date('2023-03-31'),
      receivedDate: null,
      dueDate: new Date('2023-04-28'),
      status: 'completed',
      underQuery: false,
      periodStartDay: 1,
      periodStartMonth: 3,
      periodEndDay: 31,
      periodEndMonth: 10,
      purposes: [
        [{
          alias: 'Spray Irrigation - Direct',
          primary: { code: 'A', description: 'Agriculture' },
          tertiary: { code: '400', description: 'Spray Irrigation - Direct' },
          secondary: { code: 'AGR', description: 'General Agriculture' }
        }]
      ],
      returnSubmissions: [],
      nilReturn: false,
      quantity: 0,
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
      abstractionOutsidePeriod: false,
      matched: true,
      issues: false
    }
  ]
}

function _generateLicenceData () {
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
          status: 'completed',
          underQuery: false,
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
              nilReturn: false,
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
          nilReturn: false,
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
  return dataToProcess
}
