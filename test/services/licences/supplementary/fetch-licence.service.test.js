'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const WorkflowHelper = require('../../../support/helpers/workflow.helper.js')

// Thing under test
const FetchLicenceService = require('../../../../app/services/licences/supplementary/fetch-licence.service.js')

describe('Fetch Licence Service', () => {
  let workflow

  describe('when passed a valid workflow id', () => {
    let licence

    before(async () => {
      licence = await LicenceHelper.add()

      workflow = await WorkflowHelper.add({ licenceId: licence.id })

      // sroc charge version
      const chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id })

      // two-part tariff indicators
      const chargeReference = await ChargeReferenceHelper.add({
        chargeVersionId: chargeVersion.id,
        adjustments: { s127: true }
      })

      await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id })
    })

    it('fetches the licence data related to that workflow record', async () => {
      const result = await FetchLicenceService.go(workflow.id)

      expect(result.id).to.equal(licence.id)
      expect(result.region_id).to.equal(licence.regionId)
      expect(result.include_in_sroc_billing).to.equal(licence.includeInSrocBilling)
      expect(result.created_at).to.equal(workflow.createdAt)
    })

    it('outlines which charge versions the licence has', async () => {
      const result = await FetchLicenceService.go(workflow.id)

      expect(result.sroc_charge_versions).to.equal(true)
      expect(result.two_part_tariff_charge_versions).to.equal(true)
    })
  })
})
