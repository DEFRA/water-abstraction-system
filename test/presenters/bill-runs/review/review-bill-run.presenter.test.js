'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { beforeEach, describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RegionHelper = require('../../../support/helpers/region.helper.js')
const { generateRandomInteger, generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const ReviewBillRunPresenter = require('../../../../app/presenters/bill-runs/review/review-bill-run.presenter.js')

describe('Bill Runs - Review - Review Bill Run presenter', () => {
  let billRun
  let licences

  beforeEach(() => {
    const { id: regionId, displayName } = RegionHelper.select()

    billRun = {
      id: generateUUID(),
      batchType: 'two_part_tariff',
      createdAt: new Date('2025-04-10T16:19:14.012Z'),
      scheme: 'sroc',
      status: 'review',
      summer: false,
      toFinancialYearEnding: 2025,
      region: {
        id: regionId,
        displayName
      },
      reviewLicences: [
        {
          totalNumberOfLicences: 3,
          numberOfLicencesToReview: 1
        }
      ]
    }

    licences = [
      // Licence with multiple issues
      {
        id: generateUUID(),
        issues: 'Abstraction outside period, Over abstraction, Overlap of charge dates',
        licenceId: generateUUID(),
        licenceHolder: 'Farmer Palmer',
        licenceRef: `02/${generateRandomInteger(100, 999)}`,
        progress: false,
        status: 'review'
      },
      // Licence with no issues
      {
        id: generateUUID(),
        issues: '',
        licenceId: generateUUID(),
        licenceHolder: 'Big Farm Ltd',
        licenceRef: `01/${generateRandomInteger(100, 999)}`,
        progress: false,
        status: 'ready'
      },
      // Licence with a single issue
      {
        id: generateUUID(),
        issues: 'Abstraction outside period',
        licenceId: generateUUID(),
        licenceHolder: 'Bob Bobbles',
        licenceRef: `03/${generateRandomInteger(100, 999)}`,
        progress: true,
        status: 'ready'
      }
    ]
  })

  it('correctly presents the data', () => {
    const result = ReviewBillRunPresenter.go(billRun, licences)

    expect(result).to.equal({
      backLink: { href: '/system/bill-runs', text: 'Go back to bill runs' },
      billRunId: billRun.id,
      billRunType: 'Two-part tariff',
      chargeScheme: 'Current',
      dateCreated: '10 April 2025',
      financialYear: '2024 to 2025',
      licences: [
        {
          id: licences[0].id,
          issue: 'Multiple Issues',
          licenceHolder: 'Farmer Palmer',
          licenceRef: licences[0].licenceRef,
          progress: '',
          status: 'review'
        },
        {
          id: licences[1].id,
          issue: '',
          licenceHolder: 'Big Farm Ltd',
          licenceRef: licences[1].licenceRef,
          progress: '',
          status: 'ready'
        },
        {
          id: licences[2].id,
          issue: 'Abstraction outside period',
          licenceHolder: 'Bob Bobbles',
          licenceRef: licences[2].licenceRef,
          progress: '✓',
          status: 'ready'
        }
      ],
      numberOfLicencesToReview: 1,
      pageTitle: 'Review licences',
      pageTitleCaption: `${billRun.region.displayName} two-part tariff`,
      region: billRun.region.displayName,
      reviewMessage:
        'You need to review 1 licence with returns data issues. You can then continue and send the bill run.',
      status: 'review'
    })
  })

  describe('the "licences" property', () => {
    describe('the "issues" property', () => {
      it('returns "Multiple Issues" when there are multiple issues', () => {
        const result = ReviewBillRunPresenter.go(billRun, licences)

        expect(result.licences[0].issue).to.equal('Multiple Issues')
      })

      it('returns the issue when there is a single issue', () => {
        const result = ReviewBillRunPresenter.go(billRun, licences)

        expect(result.licences[2].issue).to.equal('Abstraction outside period')
      })

      it('returns an empty string when there are no issues', () => {
        const result = ReviewBillRunPresenter.go(billRun, licences)

        expect(result.licences[1].issue).to.equal('')
      })
    })
  })

  describe('the "reviewMessage" property', () => {
    describe('when there is 1 licence to review', () => {
      it('returns the correct message with the number of licences to review', () => {
        const result = ReviewBillRunPresenter.go(billRun, licences)

        expect(result.reviewMessage).to.equal(
          'You need to review 1 licence with returns data issues. You can then continue and send the bill run.'
        )
      })
    })

    describe('when there are multiple licences to review', () => {
      beforeEach(() => {
        billRun.reviewLicences[0].numberOfLicencesToReview = 3
      })

      it('returns the correct message with the number of licences to review', () => {
        const result = ReviewBillRunPresenter.go(billRun, licences)

        expect(result.reviewMessage).to.equal(
          'You need to review 3 licences with returns data issues. You can then continue and send the bill run.'
        )
      })
    })

    describe('when there are no licences to review', () => {
      beforeEach(() => {
        billRun.reviewLicences[0].numberOfLicencesToReview = 0
      })

      it('returns the correct message', () => {
        const result = ReviewBillRunPresenter.go(billRun, licences)

        expect(result.reviewMessage).to.equal('You have resolved all returns data issues. Continue to generate bills.')
      })
    })
  })
})
