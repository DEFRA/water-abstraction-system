// Test helpers
import NotificationModel from '../../../../app/models/notification.model.js'
import ServerConfig from '../../../../config/server.config.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'
import { generateUserName } from '../../../support/helpers/user.helper.js'

// Thing under test
import CreateVerificationNotificationDal from '../../../../app/dal/users/internal/create-verification-notification.dal.js'

const { domains } = ServerConfig

describe('Users - Internal - Create Verification Notification DAL', () => {
  let email
  let resetGuid

  describe('when called', () => {
    beforeEach(() => {
      email = generateUserName()
      resetGuid = generateUUID()
    })

    it('creates a notification', async () => {
      await CreateVerificationNotificationDal(email, resetGuid)

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
