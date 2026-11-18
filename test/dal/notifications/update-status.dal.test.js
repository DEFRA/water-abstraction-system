// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import NotificationHelper from 'water-abstraction-engine/test/helpers/notification.helper.js'
import NotificationModel from 'water-abstraction-engine/models/notification.model.js'

// Thing under test
import UpdateStatusDal from '../../../src/dal/notifications/update-status.dal.js'

describe('Notifications - Update Status DAL', () => {
  let notification
  let notifyStatus
  let status
  let trx

  beforeEach(async () => {
    notification = await NotificationHelper.add({ status: 'pending' })
    notifyStatus = 'received'
    status = 'sent'
  })

  afterEach(async () => {
    await notification.$query().delete()
  })

  describe('when called', () => {
    describe('without a transaction', () => {
      it('updates the status of the notification', async () => {
        await UpdateStatusDal(notification.id, notifyStatus, status, trx)

        const updatedNotification = await notification.$query().findById(notification.id)

        expect(updatedNotification.notifyStatus).toEqual(notifyStatus)
        expect(updatedNotification.status).toEqual(status)
      })
    })

    describe('with a transaction', () => {
      beforeEach(async () => {
        trx = await NotificationModel.startTransaction()
      })

      afterEach(async () => {
        if (trx && !trx.isCompleted()) {
          await trx.rollback()
        }
      })

      it('updates the status of the notification', async () => {
        await UpdateStatusDal(notification.id, notifyStatus, status, trx)
        await trx.commit()

        const updatedNotification = await notification.$query().findById(notification.id)

        expect(updatedNotification.notifyStatus).toEqual(notifyStatus)
        expect(updatedNotification.status).toEqual(status)
      })
    })
  })
})
