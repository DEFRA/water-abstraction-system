'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things under test
const FetchCurrentReturnVersionsDal = require('../../../app/dal/return-versions/fetch-current-return-versions.dal.js')

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
      const result = await FetchCurrentReturnVersionsDal.go(licenceId)

      expect(result).to.have.length(2)
      expect(result[0].startDate).to.be.above(result[1].startDate)
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
      const result = await FetchCurrentReturnVersionsDal.go(licenceId, trx)

      expect(result).to.have.length(2)
      expect(result[0].startDate).to.be.above(result[1].startDate)
    })
  })
})
