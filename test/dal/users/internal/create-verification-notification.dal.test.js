'use strict'

// Test helpers
const NotificationModel = require('../../../../app/models/notification.model.js')
const { domains } = require('../../../../config/server.config.js')
const { generateUserName } = require('../../../support/helpers/user.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CreateVerificationNotificationDal = require('../../../../app/dal/users/internal/create-verification-notification.dal.js')

describe('Users - Internal - Create Verification Notification DAL', () => {
  let email
  let resetGuid

  describe('when called', () => {
    beforeEach(() => {
      email = generateUserName()
      resetGuid = generateUUID()
    })

    it('creates a notification', async () => {
      await CreateVerificationNotificationDal.go(email, resetGuid)

      const notification = await NotificationModel.query().where('recipient', email).limit(1).first()

      expect(notification.messageRef).toEqual('new_internal_user_email')
      expect(notification.messageType).toEqual('email')
      expect(notification.personalisation).toEqual({
        unique_create_password_link: `${domains.internal}/reset_password_change_password?resetGuid=${resetGuid}`
      })
      expect(notification.recipient).toEqual(email)
    })
  })
})
