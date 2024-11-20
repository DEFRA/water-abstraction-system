'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AllocateReturnsToChargeElementService = require('../../../../app/services/bill-runs/match/allocate-returns-to-charge-element.service.js')

describe('Allocate Returns to Charge Element Service', () => {
  describe('when there are records to process', () => {
    const chargePeriod = {
      startDate: new Date('2022-04-01'),
      endDate: new Date('2023-03-31')
    }

    let testData

    describe('and the return status is completed', () => {
      beforeEach(() => {
        testData = _generateTestData()
      })

      describe('with a charge reference/element authorised up to 32, matched to a return with a quantity of 32', () => {
        it('allocates 32 to the charge reference', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeReference.allocatedQuantity).to.equal(32)
        })

        it('allocates 32 to the charge element and adds chargeDatesOverlap property as "false"', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeElement.allocatedQuantity).to.equal(32)
          expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(32)
          expect(chargeElement.chargeDatesOverlap).to.be.false()
        })

        it('allocates all 32 from the return log', () => {
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

      describe('with a charge reference authorised up to 10, matched to a return with a quantity of 32', () => {
        beforeEach(() => {
          testData = _generateTestData()
          testData.chargeReference.volume = 10
        })

        it('allocates 10 to the charge reference', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeReference.volume).to.equal(10)
          expect(chargeReference.allocatedQuantity).to.equal(10)
        })

        it('allocates 10 to the charge element', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeElement.authorisedAnnualQuantity).to.equal(32)
          expect(chargeElement.allocatedQuantity).to.equal(10)
          expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(10)
        })

        it('allocates 10 from the return log', () => {
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

      describe('with a charge element authorised up to 10, matched to a return with a quantity of 32', () => {
        beforeEach(() => {
          testData = _generateTestData()
          testData.chargeElement.authorisedAnnualQuantity = 10
        })

        it('allocates 10 to the charge reference', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeReference.volume).to.equal(32)
          expect(chargeReference.allocatedQuantity).to.equal(10)
        })

        it('allocates 10 to the charge element', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeElement.authorisedAnnualQuantity).to.equal(10)
          expect(chargeElement.allocatedQuantity).to.equal(10)
          expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(10)
        })

        it('allocates 10 from the return log', () => {
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

      // NOTE It was found during testing that if the individual return line volumes are greater than the charge
      // reference authorised volume, which in turn is greater than the element authorised volume, that the element was
      // being over allocated. We should only be allocating to the lower volume. In this scenario 3.5 would have been
      // allocated to the element rather than the correct volume of 3. This scenario has therefore been created to test
      // that this does not happen.
      describe('with a reference authorised to 3.5, element to 3, matched to a return with line volumes of 4', () => {
        beforeEach(() => {
          testData = _generateTestData()
          testData.chargeReference.volume = 3.5
          testData.chargeElement.authorisedAnnualQuantity = 3
        })

        it('allocates 3 to the charge reference', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeReference.volume).to.equal(3.5)
          expect(chargeReference.allocatedQuantity).to.equal(3)
        })

        it('allocates 3 to the charge element', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeElement.authorisedAnnualQuantity).to.equal(3)
          expect(chargeElement.allocatedQuantity).to.equal(3)
          expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(3)
        })

        it('allocates 3 from the return log', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(matchingReturns[0].allocatedQuantity).to.equal(3)
          expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].unallocated).to.equal(1)
          expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[1].unallocated).to.equal(4)
          expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[2].unallocated).to.equal(4)
          expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[3].unallocated).to.equal(4)
          expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[4].unallocated).to.equal(4)
          expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[5].unallocated).to.equal(4)
          expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[6].unallocated).to.equal(4)
          expect(matchingReturns[0].returnSubmissions[0].returnSubmissionLines[7].unallocated).to.equal(4)
        })
      })

      describe('with a "returnSubmissionLine" outside of the "chargePeriod"', () => {
        beforeEach(() => {
          testData = _generateTestData()
          testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].startDate = new Date('2022-03-01')
          testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].endDate = new Date('2022-03-30')
        })

        it('allocates 28 to the charge reference', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeReference.allocatedQuantity).to.equal(28)
        })

        it('allocates 28 to the charge element', () => {
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

      describe('with a "returnSubmissionLine" with a "startDate" outside the charge period but endDate within', () => {
        beforeEach(() => {
          testData = _generateTestData()
          testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].startDate = new Date('2022-03-01')
          testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines[0].endDate = new Date('2022-04-30')
        })

        it('allocates 32 to the charge element and sets "chargeDatesOverlap" to true', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeElement.allocatedQuantity).to.equal(32)
          expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(32)
          expect(chargeElement.chargeDatesOverlap).to.be.true()
        })
      })

      describe('with a "returnSubmissionLine" with a "endDate" outside the charge period but startDate within', () => {
        beforeEach(() => {
          testData = _generateTestData()
          testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines[7].startDate = new Date('2023-03-01')
          testData.matchingReturns[0].returnSubmissions[0].returnSubmissionLines[7].endDate = new Date('2023-04-31')
        })

        it('allocates 28 to the charge element and sets "chargeDatesOverlap" to true', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeElement.allocatedQuantity).to.equal(28)
          expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(28)
          expect(chargeElement.chargeDatesOverlap).to.be.true()
        })
      })

      describe('with a return that has issues', () => {
        beforeEach(() => {
          testData = _generateTestData()
          testData.matchingReturns[0].underQuery = true
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

      describe('with a nil return that has no "returnSubmissionLines"', () => {
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

    describe('and the return status is due', () => {
      beforeEach(() => {
        testData = _generateTestData('due')
      })

      describe('with a charge reference/element authorised up to 32, matched to a due return', () => {
        it('fully allocates up to authorised amount of 32 to the charge reference', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeReference.allocatedQuantity).to.equal(32)
        })

        it('fully allocates up to authorised amount of 32 to the charge element', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeElement.allocatedQuantity).to.equal(32)
          expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(32)
        })

        it('allocates 32 from the return log', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(matchingReturns[0].allocatedQuantity).to.equal(32)
        })

        describe('and 10 has already been allocated to the reference/element from another return', () => {
          beforeEach(() => {
            testData.chargeReference.allocatedQuantity = 10
            testData.chargeElement.allocatedQuantity = 10
          })

          it('fully allocates up to authorised amount of 32 to the charge reference', () => {
            const { chargeElement, chargeReference, matchingReturns } = testData

            AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

            expect(chargeReference.allocatedQuantity).to.equal(32)
          })

          it('fully allocates up to authorised amount of 32 to the charge element', () => {
            const { chargeElement, chargeReference, matchingReturns } = testData

            AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

            expect(chargeElement.allocatedQuantity).to.equal(32)
            expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(22)
          })

          it('allocates 22 from the return log', () => {
            const { chargeElement, chargeReference, matchingReturns } = testData

            AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

            expect(matchingReturns[0].allocatedQuantity).to.equal(22)
          })
        })

        describe('and reference/element has been fully allocated from another return', () => {
          beforeEach(() => {
            testData.chargeReference.allocatedQuantity = 32
            testData.chargeElement.allocatedQuantity = 32
          })

          it('the fully allocated amount of 32 to the charge reference is unaltered by the due return', () => {
            const { chargeElement, chargeReference, matchingReturns } = testData

            AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

            expect(chargeReference.allocatedQuantity).to.equal(32)
          })

          it('the fully allocated amount of 32 to the charge element is unaltered by the due return', () => {
            const { chargeElement, chargeReference, matchingReturns } = testData

            AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

            expect(chargeElement.allocatedQuantity).to.equal(32)
            expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(0)
          })

          it('allocates 0 from the return log', () => {
            const { chargeElement, chargeReference, matchingReturns } = testData

            AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

            expect(matchingReturns[0].allocatedQuantity).to.equal(0)
          })
        })
      })

      describe('with a charge reference authorised up to 32, element authorised to 10, matched to a due return', () => {
        beforeEach(() => {
          testData.chargeElement.authorisedAnnualQuantity = 10
        })

        it('allocates the charge elements authorised amount of 10 to the charge reference', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeReference.volume).to.equal(32)
          expect(chargeReference.allocatedQuantity).to.equal(10)
        })

        it('fully allocates up to authorised amount of 10 to the charge element', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeElement.authorisedAnnualQuantity).to.equal(10)
          expect(chargeElement.allocatedQuantity).to.equal(10)
          expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(10)
        })

        it('allocates 10 from the return log', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(matchingReturns[0].allocatedQuantity).to.equal(10)
        })
      })

      describe('with a charge reference authorised up to 10, element authorised to 32, matched to a due return', () => {
        beforeEach(() => {
          testData.chargeReference.volume = 10
        })

        it('fully allocates up to authorised amount of 10 to the charge reference', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeReference.volume).to.equal(10)
          expect(chargeReference.allocatedQuantity).to.equal(10)
        })

        it('allocates the charge references authorised amount of 10 to the charge element', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(chargeElement.authorisedAnnualQuantity).to.equal(32)
          expect(chargeElement.allocatedQuantity).to.equal(10)
          expect(chargeElement.returnLogs[0].allocatedQuantity).to.equal(10)
        })

        it('allocates 10 from the return log', () => {
          const { chargeElement, chargeReference, matchingReturns } = testData

          AllocateReturnsToChargeElementService.go(chargeElement, matchingReturns, chargePeriod, chargeReference)

          expect(matchingReturns[0].allocatedQuantity).to.equal(10)
        })
      })
    })
  })
})

function _generateTestData (returnStatus = 'completed') {
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

  const returnSubmissions = [
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
  ]

  // If a returns status isn't "complete" it won't have any return submission lines and the "issues" will be "true"
  const matchingReturns = [
    {
      returnSubmissions: returnStatus === 'completed' ? returnSubmissions : [],
      allocatedQuantity: 0,
      status: returnStatus
    }
  ]

  return { chargeElement, chargeReference, matchingReturns }
}
