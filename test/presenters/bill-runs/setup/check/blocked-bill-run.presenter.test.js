'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { engineTriggers } = require('../../../../../app/lib/static-lookups.lib.js')

// Thing under test
const BlockedBillRunPresenter = require('../../../../../app/presenters/bill-runs/setup/check/blocked-bill-run.presenter.js')

describe('Bill Runs - Setup - Blocked Bill Run presenter', () => {
  const region = { id: '292fe1c3-c9d4-47dd-a01b-0ac916497af5', displayName: 'Avalon' }

  let blockingResults
  let session

  beforeEach(() => {
    blockingResults = {
      matches: [
        {
          id: 'c0608545-9870-4605-a407-5ff49f8a5182',
          batchType: 'annual',
          billRunNumber: 12345,
          createdAt: new Date('2024-05-01'),
          region,
          scheme: 'sroc',
          status: 'sent',
          summer: false,
          toFinancialYearEnding: 2025
        }
      ],
      toFinancialYearEnding: 2025,
      trigger: engineTriggers.neither
    }

    session = {
      id: '98ad3a1f-8e4f-490a-be05-0aece6755466',
      region: region.id,
      regionName: 'Avalon',
      type: 'annual'
    }
  })

  describe('when provided with a bill run setup session record where the bill run is blocked', () => {
    it('correctly presents the data', async () => {
      const result = BlockedBillRunPresenter.go(session, blockingResults)

      expect(result).to.equal({
        backLink: '/system/bill-runs/setup/98ad3a1f-8e4f-490a-be05-0aece6755466/region',
        billRunLink: '/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182',
        billRunNumber: 12345,
        billRunStatus: 'sent',
        billRunType: 'Annual',
        chargeScheme: 'Current',
        dateCreated: '1 May 2024',
        financialYearEnd: 2025,
        pageTitle: 'This bill run already exists',
        regionName: session.regionName,
        sessionId: session.id,
        showCreateButton: false,
        warningMessage: 'You can only have one Annual bill run per region in a financial year'
      })
    })
  })

  describe('the "billRunLink" property', () => {
    describe('when the matching bill is not in "review"', () => {
      it('returns a link to the view bill run page', () => {
        const result = BlockedBillRunPresenter.go(session, blockingResults)

        expect(result.billRunLink).to.equal('/system/bill-runs/c0608545-9870-4605-a407-5ff49f8a5182')
      })
    })

    describe('when the matching bill run is in "review"', () => {
      beforeEach(() => {
        blockingResults.matches[0].status = 'review'
      })

      describe('and its financial year is SROC', () => {
        it('returns a link to the SROC two-part tariff review screen', () => {
          const result = BlockedBillRunPresenter.go(session, blockingResults)

          expect(result.billRunLink).to.equal('/system/bill-runs/review/c0608545-9870-4605-a407-5ff49f8a5182')
        })
      })

      describe('and its financial year is PRESROC', () => {
        beforeEach(() => {
          blockingResults.matches[0].toFinancialYearEnding = 2022
          blockingResults.toFinancialYearEnding = 2022
        })

        it('returns a link to the legacy two-part tariff review screen', () => {
          const result = BlockedBillRunPresenter.go(session, blockingResults)

          expect(result.billRunLink).to.equal(
            '/billing/batch/c0608545-9870-4605-a407-5ff49f8a5182/two-part-tariff-review'
          )
        })
      })
    })
  })

  describe('the "pageTitle" property', () => {
    describe('when the matching bill run is a "supplementary"', () => {
      beforeEach(() => {
        blockingResults.matches[0].batchType = 'supplementary'
      })

      it('returns "This bill run is blocked"', () => {
        const result = BlockedBillRunPresenter.go(session, blockingResults)

        expect(result.pageTitle).to.equal('This bill run is blocked')
      })
    })

    describe('when the matching bill run is not a "supplementary"', () => {
      beforeEach(() => {
        blockingResults.matches[0].status = 'ready'
      })

      it('returns "This bill run already exists"', () => {
        const result = BlockedBillRunPresenter.go(session, blockingResults)

        expect(result.pageTitle).to.equal('This bill run already exists')
      })
    })
  })

  describe('the "warning" property', () => {
    describe('when the matching bill run is a "supplementary"', () => {
      beforeEach(() => {
        blockingResults.matches[0].batchType = 'supplementary'
      })

      it('returns a warning that tells the user to confirm or cancel ths existing bill run', () => {
        const result = BlockedBillRunPresenter.go(session, blockingResults)

        expect(result.warningMessage).to.equal(
          'You need to confirm or cancel the existing bill run before you can create a new one'
        )
      })
    })

    describe('when the matching bill run status is not "sent"', () => {
      beforeEach(() => {
        blockingResults.matches[0].status = 'ready'
      })

      it('returns a warning that tells the user to cancel the existing bill run', () => {
        const result = BlockedBillRunPresenter.go(session, blockingResults)

        expect(result.warningMessage).to.equal(
          'You need to cancel the existing bill run before you can create a new one'
        )
      })
    })

    describe('when the matching bill run is not supplementary and its status is "sent"', () => {
      it('returns a warning that tells the user they can only have one bill run of that type', () => {
        const result = BlockedBillRunPresenter.go(session, blockingResults)

        expect(result.warningMessage).to.equal('You can only have one Annual bill run per region in a financial year')
      })
    })
  })
})
