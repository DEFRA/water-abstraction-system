'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const RemoveBillRunLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/remove-bill-run-licence.service.js')

describe('Remove Bill Run Licence service', () => {
  let billRunId
  let licence
  let region

  beforeEach(async () => {
    region = RegionHelper.select()
    const billRun = await BillRunHelper.add({
      billRunNumber: 12345,
      createdAt: new Date('2024-05-03'),
      regionId: region.id,
      status: 'review',
      toFinancialYearEnding: 2023
    })

    billRunId = billRun.id

    licence = await LicenceHelper.add()
  })

  describe('when called with a valid billRunId & licenceId', () => {
    it('will fetch the data and format it for use in the Remove bill run licence confirmation page', async () => {
      const result = await RemoveBillRunLicenceService.go(billRunId, licence.id)

      expect(result).to.equal({
        pageTitle: `You're about to remove ${licence.licenceRef} from the bill run`,
        backLink: `../review/${licence.id}`,
        billRunNumber: 12345,
        billRunStatus: 'review',
        dateCreated: '3 May 2024',
        financialYear: '2022 to 2023',
        region: region.displayName
      })
    })
  })
})
