// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import RegionHelper from '../../../support/helpers/region.helper.js'
import { generateRandomInteger, generateUUID } from '../../../../app/lib/general.lib.js'

// Thing under test
import ReviewPresenter from '../../../../app/presenters/bill-runs/review/review.presenter.js'

describe('Bill Runs - Review - Review presenter', () => {
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
    const result = ReviewPresenter(billRun, licences)

    expect(result).toEqual({
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
        const result = ReviewPresenter(billRun, licences)

        expect(result.licences[0].issue).toEqual('Multiple Issues')
      })

      it('returns the issue when there is a single issue', () => {
        const result = ReviewPresenter(billRun, licences)

        expect(result.licences[2].issue).toEqual('Abstraction outside period')
      })

      it('returns an empty string when there are no issues', () => {
        const result = ReviewPresenter(billRun, licences)

        expect(result.licences[1].issue).toEqual('')
      })
    })
  })

  describe('the "reviewMessage" property', () => {
    describe('when there is 1 licence to review', () => {
      it('returns the correct message with the number of licences to review', () => {
        const result = ReviewPresenter(billRun, licences)

        expect(result.reviewMessage).toEqual(
          'You need to review 1 licence with returns data issues. You can then continue and send the bill run.'
        )
      })
    })

    describe('when there are multiple licences to review', () => {
      beforeEach(() => {
        billRun.reviewLicences[0].numberOfLicencesToReview = 3
      })

      it('returns the correct message with the number of licences to review', () => {
        const result = ReviewPresenter(billRun, licences)

        expect(result.reviewMessage).toEqual(
          'You need to review 3 licences with returns data issues. You can then continue and send the bill run.'
        )
      })
    })

    describe('when there are no licences to review', () => {
      beforeEach(() => {
        billRun.reviewLicences[0].numberOfLicencesToReview = 0
      })

      it('returns the correct message', () => {
        const result = ReviewPresenter(billRun, licences)

        expect(result.reviewMessage).toEqual('You have resolved all returns data issues. Continue to generate bills.')
      })
    })
  })
})
