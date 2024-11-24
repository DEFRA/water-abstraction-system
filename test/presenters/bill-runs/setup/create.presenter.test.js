'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CreatePresenter = require('../../../../app/presenters/bill-runs/setup/create.presenter.js')

describe('Bill Runs Setup Create presenter', () => {
  let matchingBillRun
  let session

  describe('when provided with a bill run setup session record and matching bill run', () => {
    beforeEach(() => {
      session = {
        id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
        type: 'annual'
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
      const result = CreatePresenter.go(session, matchingBillRun)

      expect(result).to.equal({
        backLink: '/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region',
        billRunId: 'c0608545-9870-4605-a407-5ff49f8a5182',
        billRunLink: '/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182',
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

    describe('the "backLink" property', () => {
      describe('when the selected bill run type is not "two_part_tariff"', () => {
        beforeEach(() => {
          session.type = 'supplementary'
        })

        it('returns a link to the region page', () => {
          const result = CreatePresenter.go(session, matchingBillRun)

          expect(result.backLink).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region')
        })
      })

      describe('when the selected bill run type is "two_part_tariff"', () => {
        beforeEach(() => {
          session.type = 'two_part_tariff'
        })

        describe('and the selected financial year is in the SROC period', () => {
          beforeEach(() => {
            session.year = '2023'
          })

          it('returns a link to the financial year page', () => {
            const result = CreatePresenter.go(session, matchingBillRun)

            expect(result.backLink).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/year')
          })
        })

        describe('and the selected financial year is in the PRESROC period', () => {
          beforeEach(() => {
            session.year = '2022'
          })

          it('returns a link to the season page', () => {
            const result = CreatePresenter.go(session, matchingBillRun)

            expect(result.backLink).to.equal('/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/season')
          })
        })
      })
    })

    describe('the "billRunLink" property', () => {
      describe("when the matching bill run's status is not 'review'", () => {
        it('returns a link to the bill run page', () => {
          const result = CreatePresenter.go(session, matchingBillRun)

          expect(result.billRunLink).to.equal('/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182')
        })
      })

      describe("when the matching bill run's status is 'review'", () => {
        beforeEach(() => {
          matchingBillRun.batchType = 'two_part_tariff'
          matchingBillRun.status = 'review'
        })

        describe("and the matching bill run's financial year is in the SROC period", () => {
          it('returns a link to the SROC review page', () => {
            const result = CreatePresenter.go(session, matchingBillRun)

            expect(result.billRunLink).to.equal('/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182/review')
          })
        })

        describe("and the matching bill run's financial year is in the PRESROC period", () => {
          beforeEach(() => {
            matchingBillRun.toFinancialYearEnding = '2022'
          })

          it('returns a link to the PRESROC review page', () => {
            const result = CreatePresenter.go(session, matchingBillRun)

            expect(result.billRunLink).to.equal(
              '/billing/batch/c0608545-9870-4605-a407-5ff49f8a5182/two-part-tariff-review'
            )
          })
        })
      })
    })

    describe('the "warningMessage" property', () => {
      describe('when the matching bill run type is "supplementary"', () => {
        beforeEach(() => {
          matchingBillRun.batchType = 'supplementary'
        })

        it('returns the "You need to confirm or cancel this [..]" message', () => {
          const result = CreatePresenter.go(session, matchingBillRun)

          expect(result.warningMessage).to.equal(
            'You need to confirm or cancel this bill run before you can create a new one'
          )
        })
      })

      describe('when the matching bill run type is not "supplementary"', () => {
        beforeEach(() => {
          matchingBillRun.batchType = 'two_part_tariff'
        })

        describe('and its status is "sent"', () => {
          beforeEach(() => {
            matchingBillRun.status = 'sent'
          })

          it('returns the "You can only have one [..]" message', () => {
            const result = CreatePresenter.go(session, matchingBillRun)

            expect(result.warningMessage).to.equal(
              'You can only have one Two-part tariff per region in a financial year'
            )
          })
        })

        describe('and its status is not "sent"', () => {
          beforeEach(() => {
            matchingBillRun.status = 'ready'
          })

          it('returns the "You need to cancel this [..]" message', () => {
            const result = CreatePresenter.go(session, matchingBillRun)

            expect(result.warningMessage).to.equal('You need to cancel this bill run before you can create a new one')
          })
        })
      })
    })
  })
})
