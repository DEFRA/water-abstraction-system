'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { beforeEach, describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NotificationModel = require('../../../../app/models/notification.model.js')
const { domains } = require('../../../../config/server.config.js')
const { generateUserName } = require('../../../support/helpers/user.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CreateNotificationDal = require('../../../../app/dal/users/internal/create-notification.dal.js')

describe('Users - Internal - Create Notification DAL', () => {
  let email
  let resetGuid

  describe('when called', () => {
    beforeEach(() => {
      email = generateUserName()
      resetGuid = generateUUID()
    })

    it('creates a notification', async () => {
      await CreateNotificationDal.go(email, resetGuid)

      const notification = await NotificationModel.query().where('recipient', email).limit(1).first()

      expect(notification.messageRef).to.equal('new_internal_user_email')
      expect(notification.messageType).to.equal('email')
      expect(notification.personalisation).to.equal({
        unique_create_password_link: `${domains.internal}/reset_password_change_password?resetGuid=${resetGuid}`
      })
      expect(notification.recipient).to.equal(email)
    })
  })
})
