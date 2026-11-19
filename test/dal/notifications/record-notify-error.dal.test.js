// Test framework
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import NotificationHelper from 'water-abstraction-engine/test/helpers/notification.helper.js'
import NotificationModel from 'water-abstraction-engine/models/notification.model.js'

// Thing under test
import RecordNotifyErrorDal from '../../../src/dal/notifications/record-notify-error.dal.js'

describe('Notifications - Record Notify Error DAL', () => {
  let notification
  let notifyRequestResult
  let trx

  beforeEach(async () => {
    notification = await NotificationHelper.add({ status: 'pending' })
  })

  afterEach(async () => {
    await notification.$query().delete()
  })

  describe('when called', () => {
    describe('without a transaction', () => {
      describe('and the error is a problem with the request', () => {
        beforeEach(() => {
          notifyRequestResult = {
            id: notification.id,
            notifyError:
              '{"errors":[{"error":"ValidationError","message":"notification_id is not a valid UUID"}],"message":"Request failed with status code 400","status":400}',
            status: 'error'
          }
        })

        it('records the error details against the notification', async () => {
          await RecordNotifyErrorDal(notifyRequestResult, trx)

          const updatedNotification = await notification.$query().findById(notification.id)

          expect(updatedNotification.notifyError).toEqual(notifyRequestResult.notifyError)
          expect(updatedNotification.notifyStatus).toBeNull()
          expect(updatedNotification.status).toEqual(notifyRequestResult.status)
        })
      })

      describe('and the error is a problem with Notify sending the notification', () => {
        beforeEach(() => {
          notifyRequestResult = {
            id: notification.id,
            notifyId: 'f001b827-faad-4b32-ba00-1c6dc2d7571c',
            notifyStatus: 'permanent-failure',
            status: 'error'
          }
        })

        it('records the error details against the notification', async () => {
          await RecordNotifyErrorDal(notifyRequestResult, trx)

          const updatedNotification = await notification.$query().findById(notification.id)

          expect(updatedNotification.notifyError).toBeNull()
          expect(updatedNotification.notifyStatus).toEqual(notifyRequestResult.notifyStatus)
          expect(updatedNotification.status).toEqual(notifyRequestResult.status)
        })
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

      describe('and the error is a problem with the request', () => {
        beforeEach(() => {
          notifyRequestResult = {
            id: notification.id,
            notifyError:
              '{"errors":[{"error":"ValidationError","message":"notification_id is not a valid UUID"}],"message":"Request failed with status code 400","status":400}',
            status: 'error'
          }
        })

        it('records the error details against the notification', async () => {
          await RecordNotifyErrorDal(notifyRequestResult, trx)
          await trx.commit()

          const updatedNotification = await notification.$query().findById(notification.id)

          expect(updatedNotification.notifyError).toEqual(notifyRequestResult.notifyError)
          expect(updatedNotification.notifyStatus).toBeNull()
          expect(updatedNotification.status).toEqual(notifyRequestResult.status)
        })
      })

      describe('and the error is a problem with Notify sending the notification', () => {
        beforeEach(() => {
          notifyRequestResult = {
            id: notification.id,
            notifyId: 'f001b827-faad-4b32-ba00-1c6dc2d7571c',
            notifyStatus: 'permanent-failure',
            status: 'error'
          }
        })

        it('records the error details against the notification', async () => {
          await RecordNotifyErrorDal(notifyRequestResult, trx)
          await trx.commit()

          const updatedNotification = await notification.$query().findById(notification.id)

          expect(updatedNotification.notifyError).toBeNull()
          expect(updatedNotification.notifyStatus).toEqual(notifyRequestResult.notifyStatus)
          expect(updatedNotification.status).toEqual(notifyRequestResult.status)
        })
      })
    })
  })
})
