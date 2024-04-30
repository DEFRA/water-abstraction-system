'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingAccountHelper = require('../../../support/helpers/billing-account.helper.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const DatabaseSupport = require('../../../support/database.js')
const ReviewChargeVersionHelper = require('../../../support/helpers/review-charge-version.helper.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')
const RegionHelper = require('../../../support/helpers/region.helper.js')

// Thing under test
const RemoveBillRunLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/remove-bill-run-licence.service.js')

describe.only('Remove Bill Run Licence service', () => {
  let billRunId
  let licenceId

  beforeEach(async () => {
    await DatabaseSupport.clean()

    const { id: regionId } = await RegionHelper.add({ displayName: 'Test Region' })
    const billRun = await BillRunHelper.add({ toFinancialYearEnding: 2023, regionId })
    billRunId = billRun.id

    const reviewLicence = await ReviewLicenceHelper.add({ billRunId, licenceRef: '01/123/ABC' })
    licenceId = reviewLicence.licenceId

    const { id: billingAccountId } = await BillingAccountHelper.add({ accountNumber: 'T12345678A' })
    const { id: chargeVersionId } = await ChargeVersionHelper.add({ licenceId, billingAccountId })
    await ReviewChargeVersionHelper.add({ reviewLicenceId: reviewLicence.id, chargeVersionId })
  })

  describe('when called with a valid billRunId & licenceId', () => {
    it('will fetch the data and format it for use in the Remove bill run licence confirmation page', async () => {
      const result = await RemoveBillRunLicenceService.go(billRunId, licenceId)

      expect(result).to.equal({
        backLink: `../review/${licenceId}`,
        billingAccount: 'T12345678A',
        financialYear: '2022 to 2023',
        licenceRef: '01/123/ABC',
        region: 'Test Region'
      })
    })
  })
})
