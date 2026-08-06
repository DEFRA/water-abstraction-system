// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import ChargeElementHelper from 'water-abstraction-engine/test/helpers/charge-element.helper.js'
import ChargeReferenceHelper from 'water-abstraction-engine/test/helpers/charge-reference.helper.js'
import ChargeVersionHelper from 'water-abstraction-engine/test/helpers/charge-version.helper.js'
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'
import WorkflowHelper from 'water-abstraction-engine/test/helpers/workflow.helper.js'

// Thing under test
import FetchLicenceService from '../../../../src/services/licences/supplementary/fetch-licence.service.js'

describe('Fetch Licence Service', () => {
  let workflow

  describe('when passed a valid workflow id', () => {
    let licence

    beforeAll(async () => {
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
      const result = await FetchLicenceService(workflow.id)

      expect(result.id).toEqual(licence.id)
      expect(result.region_id).toEqual(licence.regionId)
      expect(result.include_in_sroc_billing).toEqual(licence.includeInSrocBilling)
      expect(result.include_in_presroc_billing).toEqual(licence.includeInPresrocBilling)
      expect(result.created_at).toEqual(workflow.createdAt)
    })

    it('outlines which charge versions the licence has', async () => {
      const result = await FetchLicenceService(workflow.id)

      expect(result.sroc_charge_versions).toEqual(true)
      expect(result.two_part_tariff_charge_versions).toEqual(true)
    })
  })
})
