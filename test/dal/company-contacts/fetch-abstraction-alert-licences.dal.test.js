// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceHelper from '../../support/helpers/licence.helper.js'
import { generateUUID } from '../../support/generators.js'

// Thing under test
import FetchAbstractionAlertLicencesDal from '../../../app/dal/company-contacts/fetch-abstraction-alert-licences.dal.js'

describe('Company Contacts - Fetch Abstraction Alert Licences Dal', () => {
  let licence
  let licenceA
  let licenceB

  beforeAll(async () => {
    licence = await LicenceHelper.add()
    licenceA = await LicenceHelper.add({ licenceRef: '01/111/AA' })
    licenceB = await LicenceHelper.add({ licenceRef: '01/222/AA' })
  })

  afterAll(async () => {
    await licence.$query().delete()
    await licenceA.$query().delete()
    await licenceB.$query().delete()
  })

  describe('when there are matching licences', () => {
    it('returns the licences', async () => {
      const result = await FetchAbstractionAlertLicencesDal([licence.id])

      expect(result).toEqual([
        {
          id: licence.id,
          licenceRef: licence.licenceRef,
          revokedDate: null,
          lapsedDate: null,
          expiredDate: null
        }
      ])
    })
  })

  describe('when there are multiple matching licences', () => {
    it('returns the licences ordered by licenceRef', async () => {
      const result = await FetchAbstractionAlertLicencesDal([licenceB.id, licenceA.id])

      expect(result).toEqual([
        {
          id: licenceA.id,
          licenceRef: licenceA.licenceRef,
          revokedDate: null,
          lapsedDate: null,
          expiredDate: null
        },
        {
          id: licenceB.id,
          licenceRef: licenceB.licenceRef,
          revokedDate: null,
          lapsedDate: null,
          expiredDate: null
        }
      ])
    })
  })

  describe('when abstractionAlertLicences is null', () => {
    it('returns an empty array', async () => {
      const result = await FetchAbstractionAlertLicencesDal(null)

      expect(result).toEqual([])
    })
  })

  describe('when none of the IDs match any licences', () => {
    it('returns an empty array', async () => {
      const result = await FetchAbstractionAlertLicencesDal([generateUUID()])

      expect(result).toEqual([])
    })
  })
})
