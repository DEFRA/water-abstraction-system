// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import ReturnVersionHelper from '../../support/helpers/return-version.helper.js'
import ReturnVersionModel from '../../../app/models/return-version.model.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Things under test
import FetchCurrentReturnVersionsDal from '../../../app/dal/return-versions/fetch-current-return-versions.dal.js'

describe('DAL - Return Versions - Fetch Current Return Versions dal', () => {
  let licenceId
  let returnVersions
  let trx

  beforeEach(async () => {
    licenceId = generateUUID()

    // We add two that are current for the licence to confirm the ordering.
    // We then add one for a different licence and one that has a status of 'superseded' to confirm these are not
    // returned.
    returnVersions = [
      await ReturnVersionHelper.add({ licenceId, startDate: new Date('2024-01-01'), status: 'current' }),
      await ReturnVersionHelper.add({ licenceId, startDate: new Date('2025-04-01'), status: 'current' }),
      await ReturnVersionHelper.add({ licenceId: generateUUID(), status: 'current' }),
      await ReturnVersionHelper.add({ licenceId, status: 'superseded' })
    ]
  })

  afterEach(async () => {
    for (const returnVersion of returnVersions) {
      await returnVersion.$query().delete()
    }
  })

  describe('when called without a transaction', () => {
    it('fetches the current return versions for the specified licence', async () => {
      const result = await FetchCurrentReturnVersionsDal(licenceId)

      expect(result).toHaveLength(2)
      expect(result[0].startDate.getTime()).toBeGreaterThan(result[1].startDate.getTime())
    })
  })

  describe('when called with a transaction', () => {
    beforeEach(async () => {
      trx = await ReturnVersionModel.startTransaction()
    })

    afterEach(async () => {
      if (trx && !trx.isCompleted()) {
        await trx.rollback()
      }
    })

    it('fetches the current return versions for the specified licence', async () => {
      const result = await FetchCurrentReturnVersionsDal(licenceId, trx)

      expect(result).toHaveLength(2)
      expect(result[0].startDate.getTime()).toBeGreaterThan(result[1].startDate.getTime())
    })
  })
})
