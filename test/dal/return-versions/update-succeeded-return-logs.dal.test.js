'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../support/helpers/return-log.helper.js')
const ReturnLogModel = require('../../../app/models/return-log.model.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const { yesterday } = require('../../support/general.js')

// Thing under test
const UpdateSucceededReturnLogsDal = require('../../../app/dal/return-versions/update-succeeded-return-logs.dal.js')

describe('DAL - Return Versions - Update Succeeded Return Logs dal', () => {
  let licence
  let returnLogs
  let returnVersions
  let updatedAt

  before(async () => {
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

  after(async () => {
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
        await UpdateSucceededReturnLogsDal.go(licence.licenceRef, trx)
      })

      const results = await ReturnLogModel.query()
        .select(['id', 'updatedAt', ReturnLogModel.raw("metadata->>'isCurrent' AS current")])
        .where('licenceRef', licence.licenceRef)
        .orderBy([{ column: 'startDate', order: 'asc' }])

      expect(results).to.equal(
        [
          { id: returnLogs[0].id, current: 'false' },
          { id: returnLogs[1].id, current: 'false' },
          { id: returnLogs[2].id, current: 'true' }
        ],
        { skip: ['updatedAt'] }
      )

      // Also check we updated `updatedAt` but only on those records we set isCurrent to false
      expect(results[0].updatedAt).to.be.greaterThan(updatedAt)
      expect(results[1].updatedAt).to.be.greaterThan(updatedAt)
      expect(results[2].updatedAt).to.equal(updatedAt)
    })
  })
})
