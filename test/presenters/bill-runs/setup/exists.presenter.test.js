'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ExistsPresenter = require('../../../../app/presenters/bill-runs/setup/exists.presenter.js')

describe('Bill Runs Setup Exists presenter', () => {
  let matchingBillRun
  let session

  describe('when provided with a bill run setup session record and matching bill run', () => {
    beforeEach(() => {
      session = {
        id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
        data: { type: 'annual' }
      }

      matchingBillRun = {
        id: 'c0608545-9870-4605-a407-5ff49f8a5182',
        batchType: 'annual',
        billRunNumber: 12345,
        createdAt: new Date('2023-05-01'),
        region: { id: '06988275-b8ce-4bbc-882b-48cd13fa523c', displayName: 'stormlands' },
        scheme: 'sroc',
        status: 'sent',
        summer: false,
        toFinancialYearEnding: 2024
      }
    })

    it('correctly presents the data', () => {
      const result = ExistsPresenter.go(session, matchingBillRun)

      expect(result).to.equal({
        backLink: '/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region',
        billRunId: 'c0608545-9870-4605-a407-5ff49f8a5182',
        billRunNumber: 12345,
        billRunStatus: 'sent',
        billRunType: 'Annual',
        chargeScheme: 'Current',
        dateCreated: '1 May 2023',
        financialYear: '2023 to 2024',
        region: 'Stormlands',
        warningMessage: 'You can only have one Annual per region in a financial year'
      })
    })

    describe("the 'backLink' property", () => {
      describe("when the selected bill run type is not 'two_part_tariff'", () => {
        beforeEach(() => {
          session.data.type = 'supplementary'
        })

        it('returns a link to the region page', () => {
          const result = ExistsPresenter.go(session, matchingBillRun)

          expect(result.backLink).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region')
        })
      })

      describe("when the selected bill run type is 'two_part_tariff'", () => {
        beforeEach(() => {
          session.data.type = 'two_part_tariff'
        })

        describe('and the selected financial year is in the SROC period', () => {
          beforeEach(() => {
            session.data.year = '2023'
          })

          it('returns a link to the financial year page', () => {
            const result = ExistsPresenter.go(session, matchingBillRun)

            expect(result.backLink).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/year')
          })
        })

        describe('and the selected financial year is in the PRESROC period', () => {
          beforeEach(() => {
            session.data.year = '2022'
          })

          it('returns a link to the season page', () => {
            const result = ExistsPresenter.go(session, matchingBillRun)

            expect(result.backLink).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/season')
          })
        })
      })
    })

    describe("the 'warningMessage' property", () => {
      describe("when the matching bill run type is 'supplementary'", () => {
        beforeEach(() => {
          matchingBillRun.batchType = 'supplementary'
        })

        it("returns the 'You need to confirm or cancel this [..]' message", () => {
          const result = ExistsPresenter.go(session, matchingBillRun)

          expect(result.warningMessage).to.equal('You need to confirm or cancel this bill run before you can create a new one')
        })
      })

      describe("when the matching bill run type is not 'supplementary'", () => {
        beforeEach(() => {
          matchingBillRun.batchType = 'two_part_tariff'
        })

        describe("and its status is 'sent'", () => {
          beforeEach(() => {
            matchingBillRun.status = 'sent'
          })

          it("returns the 'You can only have one [..]' message", () => {
            const result = ExistsPresenter.go(session, matchingBillRun)

            expect(result.warningMessage).to.equal('You can only have one Two-part tariff per region in a financial year')
          })
        })

        describe("and its status is not 'sent'", () => {
          beforeEach(() => {
            matchingBillRun.status = 'ready'
          })

          it("returns the 'You need to cancel this [..]' message", () => {
            const result = ExistsPresenter.go(session, matchingBillRun)

            expect(result.warningMessage).to.equal('You need to cancel this bill run before you can create a new one')
          })
        })
      })
    })
  })
})
