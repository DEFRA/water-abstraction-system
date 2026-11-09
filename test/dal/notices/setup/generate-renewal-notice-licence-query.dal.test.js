// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'
import { db } from 'water-abstraction-engine/db/db.js'

// Thing under test
import GenerateRenewalNoticeLicenceQueryDal from '../../../../src/dal/notices/setup/generate-renewal-notice-licence-query.dal.js'

describe('Notices - Setup - Generate Renewal Notice Licence Query DAL', () => {
  let licence

  beforeAll(async () => {
    licence = await LicenceHelper.add()
  })

  afterAll(async () => {
    await licence.$query().delete()
  })

  describe('when called', () => {
    it('returns the expected query and bindings', () => {
      const result = GenerateRenewalNoticeLicenceQueryDal(licence.licenceRef)

      expect(result).toEqual({
        bindings: [licence.licenceRef],
        query: `SELECT l.licence_ref FROM public.licences l WHERE l.licence_ref = ?`
      })
    })
  })

  describe('when executed', () => {
    it('returns the expected licence', async () => {
      const { bindings, query } = GenerateRenewalNoticeLicenceQueryDal(licence.licenceRef)
      const { rows } = await db.raw(query, bindings)

      expect(rows).toEqual([{ licence_ref: licence.licenceRef }])
    })
  })
})
