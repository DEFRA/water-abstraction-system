// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import ReturnVersionHelper from '../../support/helpers/return-version.helper.js'
import { generateUUID } from '../../support/generators.js'

// Thing under test
import DetermineNextVersionNumberDal from '../../../app/dal/return-versions/determine-next-version-number.dal.js'

describe('DAL - Return Versions - Determine Next Version Number dal', () => {
  let licenceId
  let returnVersions

  beforeAll(() => {
    licenceId = generateUUID()

    returnVersions = []
  })

  afterAll(async () => {
    for (const returnVersion of returnVersions) {
      await returnVersion.$query().delete()
    }
  })

  describe('when no return versions exist for the licence', () => {
    it('returns "1" as the next version number', async () => {
      const result = await DetermineNextVersionNumberDal(licenceId)

      expect(result).toEqual(1)
    })
  })

  describe('when return versions exist for the licence', () => {
    beforeAll(async () => {
      returnVersions = [
        await ReturnVersionHelper.add({ licenceId, version: 1 }),
        await ReturnVersionHelper.add({ licenceId, version: 2 })
      ]
    })

    it('returns the next version number', async () => {
      const result = await DetermineNextVersionNumberDal(licenceId)

      expect(result).toEqual(3)
    })
  })
})
