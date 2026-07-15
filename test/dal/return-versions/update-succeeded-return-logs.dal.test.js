// Test helpers
import * as LicenceHelper from '../../support/helpers/licence.helper.js'
import * as ReturnLogHelper from '../../support/helpers/return-log.helper.js'
import * as ReturnVersionHelper from '../../support/helpers/return-version.helper.js'
import ReturnLogModel from '../../../app/models/return-log.model.js'
import { yesterday } from '../../support/general.js'

// Thing under test
import UpdateSucceededReturnLogsDal from '../../../app/dal/return-versions/update-succeeded-return-logs.dal.js'

describe('DAL - Return Versions - Update Succeeded Return Logs dal', () => {
  let licence
  let returnLogs
  let returnVersions
  let updatedAt

  beforeAll(async () => {
    licence = await LicenceHelper.add()

    updatedAt = yesterday()

    returnLogs = [
      await ReturnLogHelper.add({
        endDate: new Date('2023-03-31'),
        licenceRef: licence.licenceRef,
        startDate: new Date('2022-04-01'),
        updatedAt
      }),
      await ReturnLogHelper.add({
        endDate: new Date('2024-03-31'),
        licenceRef: licence.licenceRef,
        startDate: new Date('2023-04-01'),
        updatedAt
      }),
      await ReturnLogHelper.add({
        endDate: new Date('2025-03-31'),
        licenceRef: licence.licenceRef,
        startDate: new Date('2024-04-01'),
        updatedAt
      })
    ]

    returnVersions = [
      await ReturnVersionHelper.add({
        endDate: new Date('2024-03-31'),
        licenceId: licence.id,
        reason: 'major-change',
        startDate: new Date('2022-04-01'),
        version: 1
      }),
      await ReturnVersionHelper.add({
        endDate: null,
        licenceId: licence.id,
        reason: 'succession-or-transfer-of-licence',
        startDate: new Date('2024-04-01'),
        version: 2
      })
    ]
  })

  afterAll(async () => {
    for (const returnVersion of returnVersions) {
      await returnVersion.$query().delete()
    }

    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }

    await licence.$query().delete()
  })

  describe('when called', () => {
    it('sets "isCurrent" to false on return logs that start before the latest transferred return version for a licence', async () => {
      // We need to create a transaction here to test the service, but in reality this would be part of a larger
      // transaction that creates a new return version and its requirements.
      await ReturnLogModel.transaction(async (trx) => {
        await UpdateSucceededReturnLogsDal(licence.licenceRef, trx)
      })

      const results = await ReturnLogModel.query()
        .select(['id', 'updatedAt', ReturnLogModel.raw("metadata->>'isCurrent' AS current")])
        .where('licenceRef', licence.licenceRef)
        .orderBy([{ column: 'startDate', order: 'asc' }])

      expect(results).toMatchObject([
        { id: returnLogs[0].id, current: 'false' },
        { id: returnLogs[1].id, current: 'false' },
        { id: returnLogs[2].id, current: 'true' }
      ])

      // Also check we updated `updatedAt` but only on those records we set isCurrent to false
      expect(results[0].updatedAt.getTime()).toBeGreaterThan(updatedAt.getTime())
      expect(results[1].updatedAt.getTime()).toBeGreaterThan(updatedAt.getTime())
      expect(results[2].updatedAt).toEqual(updatedAt)
    })
  })
})
