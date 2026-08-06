// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'

// Thing under test
import ViewMarkedForSupplementaryBillingService from '../../../../src/services/licences/supplementary/view-marked-for-supplementary-billing.service.js'

describe('Licences -  View Marked For Supplementary Billing Service', () => {
  describe('when called with a valid licence ID', () => {
    let licence

    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    it('returns page data for the view', async () => {
      const result = await ViewMarkedForSupplementaryBillingService(licence.id)

      expect(result).toEqual({
        licenceRef: licence.licenceRef,
        pageTitle: "You've marked this licence for the next supplementary bill run",
        redirectLink: `/system/licences/${licence.id}/set-up`
      })
    })
  })
})
