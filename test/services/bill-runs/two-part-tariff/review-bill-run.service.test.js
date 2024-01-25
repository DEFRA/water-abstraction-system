'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers

// Things we need to stub
const DetermineBillRunIssuesService = require('../../../../app/services/bill-runs/two-part-tariff/determine-bill-run-issues.service.js')
const FetchBillRunLicencesService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-bill-run-licences.service.js')
const ReviewBillRunPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/review-bill-run.presenter.js')

// Thing under test
const ReviewBillRunService = require('../../../../app/services/bill-runs/two-part-tariff/review-bill-run.service.js')

describe('Review Bill Run Service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when a bill run with a matching ID exists', () => {
    const billRunId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
    const billRunLicences = _billRunLicences()
    const preparedBillRun = _billRun()
    const preparedLicences = _licences()

    beforeEach(() => {
      Sinon.stub(FetchBillRunLicencesService, 'go').resolves(billRunLicences)
      Sinon.stub(DetermineBillRunIssuesService, 'go').resolves()
      Sinon.stub(ReviewBillRunPresenter, 'go').returns({ preparedBillRun, preparedLicences })
    })

    it('will fetch the data and format it for use in the review bill run page', async () => {
      const result = await ReviewBillRunService.go(billRunId)

      expect(result.billRun).to.equal(preparedBillRun)
      expect(result.licences).to.equal(preparedLicences)

      expect(FetchBillRunLicencesService.go.called).to.be.true()
      expect(DetermineBillRunIssuesService.go.called).to.be.true()
      expect(ReviewBillRunPresenter.go.called).to.be.true()
    })
  })

  describe('when a bill run with a matching ID does not exist', () => {
    it('throws an exception', async () => {
      await expect(ReviewBillRunService.go('billRunId')).to.reject()
    })
  })
})

function _billRunLicences () {
  return {
    billRun: {
      id: '97db1a27-8308-4aba-b463-8a6af2558b28',
      billRunNumber: 1003,
      createdAt: new Date('2023-11-06'),
      status: 'review',
      toFinancialYearEnding: 2022,
      scheme: 'sroc',
      batchType: 'two_part_tariff',
      region: {
        id: '9827c99e-7cb5-483d-a2f3-daf397cf83e8',
        displayName: 'Southern (Test replica)'
      }
    },
    billRunLicences: [
      {
        licenseId: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
        licenseHolder: 'Charles Wharton Ltd',
        licenseRef: '7/34/10/*S/0084'
      },
      {
        licenseId: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
        licenseHolder: 'LP Sneath',
        licenseRef: '5/31/14/*S/0116A'
      }
    ]
  }
}

function _billRun () {
  return {
    region: 'Southern (Test replica)',
    status: 'REVIEW',
    dateCreated: '6 November 2023',
    financialYear: '2021 to 2022',
    chargeScheme: 'Current',
    billRunType: 'two-part tariff',
    numberOfLicences: 2,
    licencesToReviewCount: 2
  }
}

function _licences () {
  return [
    {
      licenceId: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
      licenceRef: '7/34/10/*S/0084',
      licenceHolder: 'Charles Wharton Ltd',
      licenceIssues: 'Multiple Issues',
      licenceStatus: 'REVIEW'
    },
    {
      licenceId: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
      licenceRef: '5/31/14/*S/0116A',
      licenceHolder: 'LP Sneath',
      licenceIssues: 'Multiple Issues',
      licenceStatus: 'REVIEW'
    }
  ]
}
