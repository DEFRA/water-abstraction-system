// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceHelper from '../../../support/helpers/licence.helper.js'

// Thing under test
import FetchRenewalLicenceDal from '../../../../app/dal/notices/setup/fetch-renewal-licence.dal.js'

describe('Notices - Setup - Fetch Renewal Licence DAL', () => {
  let licence

  beforeAll(async () => {
    licence = await LicenceHelper.add()
  })

  afterAll(async () => {
    await licence.$query().delete()
  })

  describe('when the licence exists', () => {
    it('returns the licence with the renewal date fields', async () => {
      const result = await FetchRenewalLicenceDal(licence.licenceRef)

      expect(result).toEqual({
        expiredDate: null,
        id: licence.id,
        lapsedDate: null,
        licenceRef: licence.licenceRef,
        revokedDate: null
      })
    })
  })

  describe('when the licence does not exist', () => {
    it('returns undefined', async () => {
      const result = await FetchRenewalLicenceDal('does-not-exist')

      expect(result).toBeUndefined()
    })
  })
})
