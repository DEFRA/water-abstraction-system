'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewBillSummariesPresenter = require('../../../app/presenters/bill-runs/view-bill-summaries.presenter.js')

describe('View Bill Summaries presenter', () => {
  let billSummaries

  describe('when provided with a populated licence summaries', () => {
    beforeEach(() => {
      billSummaries = _testBillSummaries()
    })

    it('correctly presents the data', () => {
      const result = ViewBillSummariesPresenter.go(billSummaries)

      expect(result).to.equal([
        {
          type: 'water-companies',
          caption: '1 water company',
          bills: [
            {
              id: '64924759-8142-4a08-9d1e-1e902cd9d316',
              accountNumber: 'E22288888A',
              billingContact: 'Acme Water Services Ltd',
              licences: ['17/53/001/A/101', '17/53/002/B/205', '17/53/002/C/308'],
              licencesCount: 3,
              financialYear: 2023,
              total: '£213,178.00'
            }
          ]
        },
        {
          type: 'other-abstractors',
          caption: '2 other abstractors',
          bills: [
            {
              id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
              accountNumber: 'E11101999A',
              billingContact: 'Geordie Leforge',
              licences: ['17/53/001/G/782'],
              licencesCount: 1,
              financialYear: 2023,
              total: '-£97.00'
            },
            {
              id: '88f85abd-129d-4fb6-b82e-b92224992b1d',
              accountNumber: 'E33397999A',
              billingContact: 'Flint & Michigan Squash Club Ltd',
              licences: ['17/53/001/Z/459'],
              licencesCount: 1,
              financialYear: 2023,
              total: '£79.09'
            }
          ]
        }
      ])
    })

    describe('when all the summaries are for water companies', () => {
      beforeEach(() => {
        billSummaries.forEach((summary) => {
          summary.waterCompany = true
        })
      })

      it('returns just the water companies group', () => {
        const result = ViewBillSummariesPresenter.go(billSummaries)

        expect(result).to.have.length(1)
        expect(result[0].type).to.equal('water-companies')
      })
    })

    describe('when all the summaries are for other abstractors', () => {
      beforeEach(() => {
        billSummaries.forEach((summary) => {
          summary.waterCompany = false
        })
      })

      it('returns just the other abstractors group', () => {
        const result = ViewBillSummariesPresenter.go(billSummaries)

        expect(result).to.have.length(1)
        expect(result[0].type).to.equal('other-abstractors')
      })
    })

    describe('when there are both water company and other abstractor bills', () => {
      // NOTE: The template iterates through the groups and builds the tables. When both groups are present we want
      // the water companies table first which is why the order of the groups is important.
      it('the first group is always the water companies and the second the other abstractors', () => {
        const result = ViewBillSummariesPresenter.go(billSummaries)

        expect(result).to.have.length(2)
        expect(result[0].type).to.equal('water-companies')
        expect(result[1].type).to.equal('other-abstractors')
      })
    })

    describe('the group "caption" property', () => {
      describe('when there is only 1 water bill summary', () => {
        it("the group's caption is singular (1 water company)", () => {
          const result = ViewBillSummariesPresenter.go(billSummaries)

          expect(result[0].caption).to.equal('1 water company')
        })
      })

      describe('when there are multiple water bill summaries', () => {
        beforeEach(() => {
          billSummaries[0].waterCompany = true
        })

        it("the group's caption is pluralised (2 water companies)", () => {
          const result = ViewBillSummariesPresenter.go(billSummaries)

          expect(result[0].caption).to.equal('2 water companies')
        })
      })

      describe('when there is only 1 other abstractor bill summary', () => {
        beforeEach(() => {
          billSummaries[0].waterCompany = true
        })

        it("the group's caption is singular (1 other abstractor)", () => {
          const result = ViewBillSummariesPresenter.go(billSummaries)

          expect(result[1].caption).to.equal('1 other abstractor')
        })
      })

      describe('when there are multiple other abstractor bill summaries', () => {
        it("the group's caption is pluralised (2 other abstractors)", () => {
          const result = ViewBillSummariesPresenter.go(billSummaries)

          expect(result[1].caption).to.equal('2 other abstractors')
        })
      })
    })

    describe('the bill "billingContact" property', () => {
      describe('when the bill does have an agent company name', () => {
        it('returns the agent company name', () => {
          const result = ViewBillSummariesPresenter.go(billSummaries)

          expect(result[1].bills[0].billingContact).to.equal('Geordie Leforge')
        })
      })

      describe('when the bill does not have an agent company name', () => {
        it('returns the company name', () => {
          const result = ViewBillSummariesPresenter.go(billSummaries)

          expect(result[1].bills[1].billingContact).to.equal('Flint & Michigan Squash Club Ltd')
        })
      })
    })

    describe('the bill "licences" property', () => {
      it('splits the licences provided by , and places the resulting references into an array', () => {
        const result = ViewBillSummariesPresenter.go(billSummaries)

        expect(result[0].bills[0].licences).to.equal(['17/53/001/A/101', '17/53/002/B/205', '17/53/002/C/308'])
      })
    })
  })
})

function _testBillSummaries() {
  return [
    {
      id: '7c8a248c-b71e-463c-bea8-bc5e0a5d95e2',
      billingAccountId: 'e8bd9fe1-47eb-42f2-a507-786bccd35aee',
      accountNumber: 'E11101999A',
      netAmount: -9700,
      financialYearEnding: 2023,
      companyName: 'H M Scotty & Daughter',
      agentName: 'Geordie Leforge',
      allLicences: '17/53/001/G/782',
      waterCompany: false
    },
    {
      id: '64924759-8142-4a08-9d1e-1e902cd9d316',
      billingAccountId: 'ee3f5562-26ad-4d58-9b59-5c388a13d7d0',
      accountNumber: 'E22288888A',
      netAmount: 21317800,
      financialYearEnding: 2023,
      companyName: 'Acme Water Services Ltd',
      agentName: null,
      allLicences: '17/53/001/A/101,17/53/002/B/205,17/53/002/C/308',
      waterCompany: true
    },
    {
      id: '88f85abd-129d-4fb6-b82e-b92224992b1d',
      billingAccountId: '5313ce61-0f35-4e37-b8b9-a1b4f408f32e',
      accountNumber: 'E33397999A',
      netAmount: 7909,
      financialYearEnding: 2023,
      companyName: 'Flint & Michigan Squash Club Ltd',
      agentName: null,
      allLicences: '17/53/001/Z/459',
      waterCompany: false
    }
  ]
}
