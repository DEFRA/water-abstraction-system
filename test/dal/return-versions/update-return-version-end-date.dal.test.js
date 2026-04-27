'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')
const ReturnVersionModel = require('../../../app/models/return-version.model.js')

// Things under test
const UpdateReturnVersionEndDateDal = require('../../../app/dal/return-versions/update-return-version-end-date.dal.js')

describe('DAL - Return Versions - Update Return Version End Date dal', () => {
  let endDate
  let returnVersion
  let trx

  beforeEach(async () => {
    returnVersion = await ReturnVersionHelper.add({ endDate: null })

    endDate = new Date('2026-04-30')
  })

  afterEach(async () => {
    await returnVersion.$query().delete()
  })

  describe('when called without a transaction', () => {
    it('updates the end date for the specified return version', async () => {
      await UpdateReturnVersionEndDateDal.go(returnVersion.$id(), endDate)

      const result = await returnVersion.$query()

      expect(result.endDate.toISOString()).to.equal(endDate.toISOString())
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

    it('updates the end date for the specified return version', async () => {
      await UpdateReturnVersionEndDateDal.go(returnVersion.$id(), endDate, trx)
      await trx.commit()

      const result = await returnVersion.$query()

      expect(result.endDate.toISOString()).to.equal(endDate.toISOString())
    })
  })
})
