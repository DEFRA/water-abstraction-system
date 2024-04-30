'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const RemoveBillRunLicencePresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/remove-bill-run-licence.presenter.js')

describe('Cancel Bill Run presenter', () => {
  let billRun
  let licence

  describe('when provided with a licence that has a single billing account', () => {
    beforeEach(() => {
      billRun = { region: 'Test Region', toFinancialYearEnding: 2023 }
      licence = [{
        licenceId: '85a8e2d7-b73f-45a1-b5fd-ba5632b43442',
        licenceRef: '01/123/ABC',
        accountNumber: 'J10000070A'
      }]
    })

    it('correctly presents the data', () => {
      const result = RemoveBillRunLicencePresenter.go(billRun, licence)

      expect(result).to.equal({
        backLink: `../review/${licence[0].licenceId}`,
        billingAccount: 'J10000070A',
        financialYear: '2022 to 2023',
        licenceRef: licence[0].licenceRef,
        region: billRun.region
      })
    })
  })

  describe('when provided with a licence that has multiple billing accounts', () => {
    beforeEach(() => {
      billRun = { region: 'Test Region', toFinancialYearEnding: 2023 }
      licence = [
        {
          licenceId: '85a8e2d7-b73f-45a1-b5fd-ba5632b43442',
          licenceRef: '01/123/ABC',
          accountNumber: 'J10000070A'
        },
        {
          licenceId: '85a8e2d7-b73f-45a1-b5fd-ba5632b43442',
          licenceRef: '01/123/ABC',
          accountNumber: 'X99999999A'
        }
      ]
    })

    it('correctly presents the data', () => {
      const result = RemoveBillRunLicencePresenter.go(billRun, licence)

      expect(result).to.equal({
        backLink: `../review/${licence[0].licenceId}`,
        billingAccount: 'J10000070A, X99999999A',
        financialYear: '2022 to 2023',
        licenceRef: licence[0].licenceRef,
        region: billRun.region
      })
    })
  })
})
