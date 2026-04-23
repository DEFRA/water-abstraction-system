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
const UpdateReturnVersionStatusDal = require('../../../app/dal/return-versions/update-return-version-status.dal.js')

describe('DAL - Return Versions - Update Return Version Status dal', () => {
  let status
  let returnVersion
  let trx

  beforeEach(async () => {
    returnVersion = await ReturnVersionHelper.add({ status: 'current' })

    status = 'superseded'
  })

  afterEach(async () => {
    await returnVersion.$query().delete()
  })

  describe('when called without a transaction', () => {
    it('updates the status for the specified return version', async () => {
      await UpdateReturnVersionStatusDal.go(returnVersion.$id(), status)

      const result = await returnVersion.$query()

      expect(result.status).to.equal(status)
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

    it('updates the status for the specified return version', async () => {
      await UpdateReturnVersionStatusDal.go(returnVersion.$id(), status, trx)
      await trx.commit()

      const result = await returnVersion.$query()

      expect(result.status).to.equal(status)
    })
  })
})
