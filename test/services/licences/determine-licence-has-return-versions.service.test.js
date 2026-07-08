// Test helpers
import * as ReturnVersionHelper from '../../support/helpers/return-version.helper.js'

// Thing under test
import FetchLicenceHasRequirementsService from '../../../app/services/licences/determine-licence-has-return-versions.service.js'

describe('Fetch Licence Has Requirements service', () => {
  const licenceId = 'e004c0c9-0316-42fc-a6e3-5ae9a271b3c6'

  describe('when the licence has return versions', () => {
    beforeEach(async () => {
      await ReturnVersionHelper.add({ licenceId })
    })

    it('returns true', async () => {
      const result = await FetchLicenceHasRequirementsService(licenceId)

      expect(result).toBe(true)
    })
  })

  describe('when the licence does not have return versions', () => {
    it('returns false', async () => {
      const result = await FetchLicenceHasRequirementsService('ed3b9b1a-94e0-480c-8ad6-60e05f5fa9f4')

      expect(result).toBe(false)
    })
  })
})
