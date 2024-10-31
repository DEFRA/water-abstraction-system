'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it } = require('node:test')
const { expect } = Code

// Thing under test
const RemoveBillRunLicencePresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/remove-bill-run-licence.presenter.js')

describe('Cancel Bill Run presenter', () => {
  describe('when provided with bill run and licence data', () => {
    const billRun = {
      billRunNumber: 12345,
      createdAt: new Date('2024-05-03'),
      region: 'Test Region',
      status: 'review',
      toFinancialYearEnding: 2023
    }
    const licenceId = '85a8e2d7-b73f-45a1-b5fd-ba5632b43442'
    const licenceRef = '01/123/ABC'

    it('correctly presents the data', () => {
      const result = RemoveBillRunLicencePresenter.go(billRun, licenceId, licenceRef)

      expect(result).to.equal({
        pageTitle: "You're about to remove 01/123/ABC from the bill run",
        backLink: `../review/${licenceId}`,
        billRunNumber: billRun.billRunNumber,
        billRunStatus: billRun.status,
        dateCreated: '3 May 2024',
        financialYear: '2022 to 2023',
        region: billRun.region
      })
    })
  })
})
