'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ReviewBillRunPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/review-bill-run.presenter.js')

describe('Review Bill Run presenter', () => {
  describe('when there is data to be presented for review', () => {
    const testBillRun = _testBillRun()
    const testLicences = _testLicences()

    it('correctly presents the bill run data', () => {
      const result = ReviewBillRunPresenter.go(testBillRun, testLicences)

      expect(result.region).to.equal(testBillRun.region.displayName)
      expect(result.status).to.equal(testBillRun.status)
      expect(result.status).to.equal(testBillRun.status)
      expect(result.dateCreated).to.equal('17 January 2024')
      expect(result.financialYear).to.equal('2022 to 2023')
      expect(result.chargeScheme).to.equal('Current')
      expect(result.billRunType).to.equal('two-part tariff')
      expect(result.numberOfLicences).to.equal(3)
      expect(result.licencesToReviewCount).to.equal(1)
    })

    it('correctly presents the data for the licence with no issues', () => {
      const result = ReviewBillRunPresenter.go(testBillRun, testLicences)

      expect(result.licences[0].id).to.equal(testLicences[0].id)
      expect(result.licences[0].licenceRef).to.equal(testLicences[0].licenceRef)
      expect(result.licences[0].licenceHolder).to.equal(testLicences[0].licenceHolder)
      expect(result.licences[0].status).to.equal(testLicences[0].status)
      expect(result.licences[0].issue).to.equal('')
    })

    it('correctly presents the data for the licence with a single issue', () => {
      const result = ReviewBillRunPresenter.go(testBillRun, testLicences)

      expect(result.licences[1].id).to.equal(testLicences[1].id)
      expect(result.licences[1].licenceRef).to.equal(testLicences[1].licenceRef)
      expect(result.licences[1].licenceHolder).to.equal(testLicences[1].licenceHolder)
      expect(result.licences[1].status).to.equal(testLicences[1].status)
      expect(result.licences[1].issue).to.equal(testLicences[1].issues[0])
    })

    it('correctly presents the data for the licence with a single issue', () => {
      const result = ReviewBillRunPresenter.go(testBillRun, testLicences)

      expect(result.licences[2].id).to.equal(testLicences[2].id)
      expect(result.licences[2].licenceRef).to.equal(testLicences[2].licenceRef)
      expect(result.licences[2].licenceHolder).to.equal(testLicences[2].licenceHolder)
      expect(result.licences[2].status).to.equal(testLicences[2].status)
      expect(result.licences[2].issue).to.equal('Multiple Issues')
    })
  })
})

function _testBillRun () {
  return {
    id: 'b21bd372-cd04-405d-824e-5180d854121c',
    createdAt: new Date('2024-01-17'),
    status: 'review',
    toFinancialYearEnding: 2023,
    scheme: 'sroc',
    batchType: 'two_part_tariff',
    region: {
      displayName: 'Southern (Test replica)'
    }
  }
}

function _testLicences () {
  return [
    // Licence with no issues
    {
      id: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
      licenceRef: '1/11/11/*11/1111',
      licenceHolder: 'Big Farm Ltd',
      issues: [],
      status: 'ready'
    },
    // Licence with a single issue
    {
      id: '395bdc01-605b-44f5-9d90-5836cc013799',
      licenceRef: '2/22/22/*S2/2222',
      licenceHolder: 'Bob Bobbles',
      issues: ['Abstraction outside period'],
      status: 'ready'
    },
    // Licence wuth multiple issues
    {
      id: 'fdae33da-9195-4b97-976a-9791bc4f6b66',
      licenceRef: '3/33/33/*3/3333',
      licenceHolder: 'Farmer Palmer',
      issues: [
        'Abstraction outside period',
        'Over abstraction',
        'Overlap of charge dates'
      ],
      status: 'review'
    }
  ]
}
