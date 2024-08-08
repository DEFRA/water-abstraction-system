'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const DatabaseSupport = require('../../../support/database.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const RemoveBillRunLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/remove-bill-run-licence.service.js')

describe('Remove Bill Run Licence service', () => {
  let billRunId
  let licenceId
  let region

  beforeEach(async () => {
    await DatabaseSupport.clean()

    region = RegionHelper.select()
    const billRun = await BillRunHelper.add({
      billRunNumber: 12345,
      createdAt: new Date('2024-05-03'),
      regionId: region.id,
      status: 'review',
      toFinancialYearEnding: 2023
    })

    billRunId = billRun.id

    const licence = await LicenceHelper.add({ licenceRef: '01/123/ABC' })

    licenceId = licence.id
  })

  describe('when called with a valid billRunId & licenceId', () => {
    it('will fetch the data and format it for use in the Remove bill run licence confirmation page', async () => {
      const result = await RemoveBillRunLicenceService.go(billRunId, licenceId)

      expect(result).to.equal({
        pageTitle: "You're about to remove 01/123/ABC from the bill run",
        backLink: `../review/${licenceId}`,
        billRunNumber: 12345,
        billRunStatus: 'review',
        dateCreated: '3 May 2024',
        financialYear: '2022 to 2023',
        region: region.displayName
      })
    })
  })
})
