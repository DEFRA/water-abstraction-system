'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AllocateReturnsToChargeElementService = require('../../../../app/services/bill-runs/two-part-tariff/allocate-returns-to-charge-element.service.js')

describe('Allocate Returns to Charge Element Service', () => {
  describe('when there are records to process', () => {
    const chargePeriod = {
      startDate: new Date('2022-04-01'),
      endDate: new Date('2023-03-31')
    }

    let testData

    describe('with a charge reference/element authorised upto 32, matched to a return with a quantity of 32', () => {
      beforeEach(() => {
        testData = _generateTestData()
      })

      it('correctly allocates 32 to the charge reference', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(chargeReference.allocatedQuantity).to.equal(32)
      })

      it('correctly allocates 32 to the charge element and adds chargeDatesOverlap item as `false`', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(chargeElement.allocatedQuantity).to.equal(32)
        expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(32)
        expect(chargeElement.chargeDatesOverlap).to.be.false()
      })

      it('correctly allocates all 32 from the return log', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(matchingReturns[0].allocatedQuantity).to.equal(32)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[1].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[2].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[3].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[4].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[5].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[6].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[7].unallocated).to.equal(0)
      })
    })

    describe('with a charge reference authorised upto 10, matched to a return with a quantity of 32', () => {
      beforeEach(() => {
        testData = _generateTestData()
        testData.chargeReference.volume = 10
      })

      it('correctly allocates 10 to the charge reference', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(chargeReference.volume).to.equal(10)
        expect(chargeReference.allocatedQuantity).to.equal(10)
      })

      it('correctly allocates 10 to the charge element', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(chargeElement.authorisedAnnualQuantity).to.equal(32)
        expect(chargeElement.allocatedQuantity).to.equal(10)
        expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(10)
      })

      it('correctly allocates 10 from the return log', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(matchingReturns[0].allocatedQuantity).to.equal(10)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[1].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[2].unallocated).to.equal(2)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[3].unallocated).to.equal(4)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[4].unallocated).to.equal(4)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[5].unallocated).to.equal(4)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[6].unallocated).to.equal(4)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[7].unallocated).to.equal(4)
      })
    })

    describe('with a charge element authorised upto 10, matched to a return with a quantity of 32', () => {
      beforeEach(() => {
        testData = _generateTestData()
        testData.chargeElement.authorisedAnnualQuantity = 10
      })

      it('correctly allocates 10 to the charge reference', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(chargeReference.volume).to.equal(32)
        expect(chargeReference.allocatedQuantity).to.equal(10)
      })

      it('correctly allocates 10 to the charge element', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(chargeElement.authorisedAnnualQuantity).to.equal(10)
        expect(chargeElement.allocatedQuantity).to.equal(10)
        expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(10)
      })

      it('correctly allocates 10 from the return log', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(matchingReturns[0].allocatedQuantity).to.equal(10)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[1].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[2].unallocated).to.equal(2)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[3].unallocated).to.equal(4)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[4].unallocated).to.equal(4)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[5].unallocated).to.equal(4)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[6].unallocated).to.equal(4)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[7].unallocated).to.equal(4)
      })
    })

    describe('with a `returnSubmissionLine` outside of the `chargePeriod`', () => {
      beforeEach(() => {
        testData = _generateTestData()
        testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].startDate = new Date('2022-03-01')
        testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].endDate = new Date('2022-03-30')
      })

      it('correctly allocates 28 to the charge reference', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(chargeReference.allocatedQuantity).to.equal(28)
      })

      it('correctly allocates 28 to the charge element', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(chargeElement.allocatedQuantity).to.equal(28)
        expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(28)
      })

      it('does not include the line outside of the charge period and allocates 28 from the return log', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(matchingReturns[0].allocatedQuantity).to.equal(28)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].unallocated).to.equal(4)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[1].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[2].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[3].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[4].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[5].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[6].unallocated).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[7].unallocated).to.equal(0)
      })
    })

    describe('with a `returnSubmissionLine` with a `startDate` outside the charge period but endDate within', () => {
      beforeEach(() => {
        testData = _generateTestData()
        testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].startDate = new Date('2022-03-01')
        testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].endDate = new Date('2022-04-30')
      })

      it('correctly allocates 32 to the charge element and sets `chargeDatesOverlap` to true', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(chargeElement.allocatedQuantity).to.equal(32)
        expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(32)
        expect(chargeElement.chargeDatesOverlap).to.be.true()
      })
    })

    describe('with a `returnSubmissionLine` with a `endDate` outside the charge period but startDate within', () => {
      beforeEach(() => {
        testData = _generateTestData()
        testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines[7].startDate = new Date('2023-03-01')
        testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines[7].endDate = new Date('2023-04-31')
      })

      it('correctly allocates 32 to the charge element and sets `chargeDatesOverlap` to true', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(chargeElement.allocatedQuantity).to.equal(32)
        expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(32)
        expect(chargeElement.chargeDatesOverlap).to.be.true()
      })
    })

    describe('with a return that has issues', () => {
      beforeEach(() => {
        testData = _generateTestData()
        testData.matchingReturns[0].issues = true
      })

      it('does not allocate anything from the return log', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(chargeReference.allocatedQuantity).to.equal(0)

        expect(chargeElement.allocatedQuantity).to.equal(0)
        expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(0)

        expect(matchingReturns[0].allocatedQuantity).to.equal(0)
        expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].unallocated).to.equal(4)
      })
    })

    describe('with a nil return that has no `returnSubmissionLines`', () => {
      beforeEach(() => {
        testData = _generateTestData()
        testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines = []
      })

      it('does not allocate anything from the return log', () => {
        const { chargeElement, chargeReference, matchingReturns } = testData

        AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

        expect(chargeReference.allocatedQuantity).to.equal(0)

        expect(chargeElement.allocatedQuantity).to.equal(0)
        expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(0)

        expect(matchingReturns[0].allocatedQuantity).to.equal(0)
      })
    })
  })
})

function _generateTestData () {
  // Data not required for the tests has been excluded from the generated data
  const chargeElement = {
    authorisedAnnualQuantity: 32,
    returnLogs: [
      {
        allocatedQuantity: 0
      }
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

  const chargeReference = {
    volume: 32,
    allocatedQuantity: 0
  }

  const matchingReturns = [
    {
      returnSubmissions: [
        {
          returnSubmissionLines: [
            {
              startDate: new Date('2022-04-01'),
              endDate: new Date('2022-04-30'),
              unallocated: 4
            },
            {
              startDate: new Date('2022-05-01'),
              endDate: new Date('2022-05-31'),
              unallocated: 4
            },
            {
              startDate: new Date('2022-06-01'),
              endDate: new Date('2022-06-30'),
              unallocated: 4
            },
            {
              startDate: new Date('2022-07-01'),
              endDate: new Date('2022-07-31'),
              unallocated: 4
            },
            {
              startDate: new Date('2022-08-01'),
              endDate: new Date('2022-08-31'),
              unallocated: 4
            },
            {
              startDate: new Date('2022-09-01'),
              endDate: new Date('2022-09-30'),
              unallocated: 4
            },
            {
              startDate: new Date('2022-10-01'),
              endDate: new Date('2022-10-31'),
              unallocated: 4
            },
            {
              startDate: new Date('2023-03-01'),
              endDate: new Date('2023-03-31'),
              unallocated: 4
            }
          ]
        }
      ],
      allocatedQuantity: 0,
      issues: false
    }
  ]

  return { chargeElement, chargeReference, matchingReturns }
}
