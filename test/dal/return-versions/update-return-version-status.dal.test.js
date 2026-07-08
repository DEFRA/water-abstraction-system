// Test helpers
import * as ReturnVersionHelper from '../../support/helpers/return-version.helper.js'
import ReturnVersionModel from '../../../app/models/return-version.model.js'

// Things under test
import UpdateReturnVersionStatusDal from '../../../app/dal/return-versions/update-return-version-status.dal.js'

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
      await UpdateReturnVersionStatusDal(returnVersion.$id(), status)

      const result = await returnVersion.$query()

      expect(result.status).toEqual(status)
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
      await UpdateReturnVersionStatusDal(returnVersion.$id(), status, trx)
      await trx.commit()

      const result = await returnVersion.$query()

      expect(result.status).toEqual(status)
    })
  })
})
