'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const DatabaseConfig = require('../../../../config/database.config.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')
const { generateRandomInteger, today } = require('../../../../app/lib/general.lib.js')

// Thing under test
const FetchBillRunLicencesService = require('../../../../app/services/bill-runs/review/fetch-bill-run-licences.service.js')

describe('Bill Runs - Review - Fetch Bill Run Licences service', () => {
  const todaysDate = today()

  let filters
  let page
  let region
  let billRun
  let testLicenceReady
  let testLicenceReview
  let testLicenceNoIssues

  before(async () => {
    region = RegionHelper.select()

    billRun = await BillRunHelper.add({
      batchType: 'two_part_tariff',
      createdAt: todaysDate,
      regionId: region.id,
      status: 'review',
      toFinancialYearEnding: todaysDate.getFullYear()
    })

    testLicenceReady = await ReviewLicenceHelper.add({
      billRunId: billRun.id,
      licenceHolder: 'Ready Licence Holder Ltd',
      licenceRef: `01/${generateRandomInteger(100, 9999)}`,
      status: 'ready',
      progress: true,
      issues: 'Returns received late'
    })

    testLicenceReview = await ReviewLicenceHelper.add({
      billRunId: billRun.id,
      licenceHolder: 'Review Licence Holder Ltd',
      licenceRef: `02/${generateRandomInteger(100, 9999)}`,
      status: 'review',
      issues: 'Over abstraction, Returns received but not processed'
    })

    testLicenceNoIssues = await ReviewLicenceHelper.add({
      billRunId: billRun.id,
      licenceHolder: 'No issues Licence Holder Ltd',
      licenceRef: `03/${generateRandomInteger(100, 9999)}`,
      status: 'ready',
      issues: ''
    })
  })

  beforeEach(() => {
    // NOTE: _filters() generates an empty filters object as used by the services that call FetchBillRunLicencesService when no filter
    // has been applied by the user
    filters = _filters()
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
    await testLicenceNoIssues.$query().delete()
    await testLicenceReview.$query().delete()
    await testLicenceReady.$query().delete()
    await billRun.$query().delete()
  })

  describe('when no filter is applied', () => {
    beforeEach(() => {
      // NOTE: We set the default page size to 1000 to ensure we get all records and avoid failed tests when run as
      // part of the full suite, and the risk our test record is returned in the second page of results.
      Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1000)
    })

    it('returns details of the bill run and the licences in it', async () => {
      const result = await FetchBillRunLicencesService.go(billRun.id, filters, page)

      expect(result).to.equal({
        billRun: {
          id: billRun.id,
          batchType: 'two_part_tariff',
          createdAt: todaysDate,
          scheme: 'sroc',
          status: 'review',
          summer: false,
          toFinancialYearEnding: todaysDate.getFullYear(),
          region: {
            id: region.id,
            displayName: region.displayName
          },
          reviewLicences: [
            {
              totalNumberOfLicences: 3,
              numberOfLicencesToReview: 1
            }
          ]
        },
        licences: {
          results: [
            {
              id: testLicenceReview.id,
              licenceId: testLicenceReview.licenceId,
              licenceRef: testLicenceReview.licenceRef,
              licenceHolder: 'Review Licence Holder Ltd',
              issues: 'Over abstraction, Returns received but not processed',
              progress: false,
              status: 'review'
            },
            {
              id: testLicenceReady.id,
              licenceId: testLicenceReady.licenceId,
              licenceRef: testLicenceReady.licenceRef,
              licenceHolder: 'Ready Licence Holder Ltd',
              issues: 'Returns received late',
              progress: true,
              status: 'ready'
            },
            {
              id: testLicenceNoIssues.id,
              licenceId: testLicenceNoIssues.licenceId,
              licenceRef: testLicenceNoIssues.licenceRef,
              licenceHolder: 'No issues Licence Holder Ltd',
              issues: '',
              progress: false,
              status: 'ready'
            }
          ],
          total: 3
        }
      })
    })
  })

  describe('when a filter is applied', () => {
    beforeEach(() => {
      Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1000)
    })

    describe('and "Issues" has been set', () => {
      describe('to the "no-issues" issue', () => {
        beforeEach(() => {
          filters.issues.push('no-issues')
        })

        it('returns the matching licences', async () => {
          const result = await FetchBillRunLicencesService.go(billRun.id, filters, page)

          expect(result.licences).equals({
            results: [
              {
                id: testLicenceNoIssues.id,
                licenceId: testLicenceNoIssues.licenceId,
                licenceRef: testLicenceNoIssues.licenceRef,
                licenceHolder: 'No issues Licence Holder Ltd',
                issues: '',
                progress: false,
                status: 'ready'
              }
            ],
            total: 1
          })
        })
      })

      describe('with a single issue', () => {
        beforeEach(() => {
          filters.issues.push('returns-late')
        })

        it('returns the matching licences', async () => {
          const result = await FetchBillRunLicencesService.go(billRun.id, filters, page)

          expect(result.licences).equals({
            results: [
              {
                id: testLicenceReady.id,
                licenceId: testLicenceReady.licenceId,
                licenceRef: testLicenceReady.licenceRef,
                licenceHolder: 'Ready Licence Holder Ltd',
                issues: 'Returns received late',
                progress: true,
                status: 'ready'
              }
            ],
            total: 1
          })
        })
      })

      describe('with multiple issues', () => {
        beforeEach(() => {
          filters.issues.push('over-abstraction', 'returns-late')
        })

        it('returns the matching licences', async () => {
          const result = await FetchBillRunLicencesService.go(billRun.id, filters, page)

          expect(result.licences).equals({
            results: [
              {
                id: testLicenceReview.id,
                licenceId: testLicenceReview.licenceId,
                licenceRef: testLicenceReview.licenceRef,
                licenceHolder: 'Review Licence Holder Ltd',
                issues: 'Over abstraction, Returns received but not processed',
                progress: false,
                status: 'review'
              },
              {
                id: testLicenceReady.id,
                licenceId: testLicenceReady.licenceId,
                licenceRef: testLicenceReady.licenceRef,
                licenceHolder: 'Ready Licence Holder Ltd',
                issues: 'Returns received late',
                progress: true,
                status: 'ready'
              }
            ],
            total: 2
          })
        })
      })
    })

    describe('and "licenceHolderNumber" has been set', () => {
      describe('with part of a licence number', () => {
        beforeEach(() => {
          filters.licenceHolderNumber = '02/'
        })

        it('returns the matching licences', async () => {
          const result = await FetchBillRunLicencesService.go(billRun.id, filters, page)

          expect(result.licences).equals({
            results: [
              {
                id: testLicenceReview.id,
                licenceId: testLicenceReview.licenceId,
                licenceRef: testLicenceReview.licenceRef,
                licenceHolder: 'Review Licence Holder Ltd',
                issues: 'Over abstraction, Returns received but not processed',
                progress: false,
                status: 'review'
              }
            ],
            total: 1
          })
        })
      })

      describe('with part of a licence holder name', () => {
        beforeEach(() => {
          filters.licenceHolderNumber = 'ready'
        })

        it('returns the matching licences', async () => {
          const result = await FetchBillRunLicencesService.go(billRun.id, filters, page)

          expect(result.licences).equals({
            results: [
              {
                id: testLicenceReady.id,
                licenceId: testLicenceReady.licenceId,
                licenceRef: testLicenceReady.licenceRef,
                licenceHolder: 'Ready Licence Holder Ltd',
                issues: 'Returns received late',
                progress: true,
                status: 'ready'
              }
            ],
            total: 1
          })
        })
      })
    })

    describe('and "licenceStatus" has been set', () => {
      beforeEach(() => {
        filters.licenceStatus = 'review'
      })

      it('returns the matching licences', async () => {
        const result = await FetchBillRunLicencesService.go(billRun.id, filters, page)

        expect(result.licences).equals({
          results: [
            {
              id: testLicenceReview.id,
              licenceId: testLicenceReview.licenceId,
              licenceRef: testLicenceReview.licenceRef,
              licenceHolder: 'Review Licence Holder Ltd',
              issues: 'Over abstraction, Returns received but not processed',
              progress: false,
              status: 'review'
            }
          ],
          total: 1
        })
      })
    })

    describe('and "progress" has been set', () => {
      beforeEach(() => {
        filters.progress.push('inProgress')
      })

      it('returns the matching licences', async () => {
        const result = await FetchBillRunLicencesService.go(billRun.id, filters, page)

        expect(result.licences).equals({
          results: [
            {
              id: testLicenceReady.id,
              licenceId: testLicenceReady.licenceId,
              licenceRef: testLicenceReady.licenceRef,
              licenceHolder: 'Ready Licence Holder Ltd',
              issues: 'Returns received late',
              progress: true,
              status: 'ready'
            }
          ],
          total: 1
        })
      })
    })
  })

  describe('when the results are paginated', () => {
    beforeEach(() => {
      page = '2'

      // NOTE: We know we create 3 records so we set the value to 2 to ensure the results are paginated
      Sinon.stub(DatabaseConfig, 'defaultPageSize').value(2)
    })

    it('can return the selected page of licences', async () => {
      const result = await FetchBillRunLicencesService.go(billRun.id, filters, page)

      expect(result.licences.results).not.to.be.empty()
    })
  })
})

function _filters() {
  return {
    issues: [],
    licenceHolderNumber: null,
    licenceStatus: null,
    progress: []
  }
}
