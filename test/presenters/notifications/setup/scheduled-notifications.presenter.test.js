'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ScheduledNotificationPresenter = require('../../../../app/presenters/notifications/setup/scheduled-notifications.presenter.js')

describe.only('Notifications Setup - Scheduled Notification Presenter', () => {
  let notification
  let journey

  describe('when the journey is for "invitations"', () => {
    beforeEach(() => {
      journey = 'invitations'
    })

    describe('and the notification is an "email', () => {
      beforeEach(() => {
        notification = _email()
      })

      describe('and the recipient is a "Primary user"', () => {
        it('correctly transform the "email" notification into a "scheduled_notifications"', () => {
          const result = ScheduledNotificationPresenter.go(notification, journey)

          expect(result).to.equal({
            messageRef: 'returns_invitation_primary_user_email',
            messageType: 'email',
            personalisation: notification.options.personalisation,
            recipient: notification.emailAddress
          })
        })
      })

      describe('and the recipient is a "Returns agent"', () => {
        beforeEach(() => {
          notification = _email()

          notification.templateId = '41c45bd4-8225-4d7e-a175-b48b613b5510'
        })

        it('correctly transform the "email" notification into a "scheduled_notifications"', () => {
          const result = ScheduledNotificationPresenter.go(notification, journey)

          expect(result).to.equal({
            messageRef: 'returns_invitation_returns_agent_email',
            messageType: 'email',
            personalisation: notification.options.personalisation,
            recipient: notification.emailAddress
          })
        })
      })
    })

    describe('and the notification is a "letter', () => {
      beforeEach(() => {
        notification = _letter()
      })

      describe('and the recipient is a "Licence holder"', () => {
        it('correctly transform the "letter" notification into a "scheduled_notifications"', () => {
          const result = ScheduledNotificationPresenter.go(notification, journey)

          expect(result).to.equal({
            messageRef: 'returns_invitation_licence_holder_letter',
            messageType: 'letter',
            personalisation: notification.options.personalisation
          })
        })
      })

      describe('and the recipient is a "Returns to"', () => {
        beforeEach(() => {
          notification = _letter()

          notification.templateId = '0e535549-99a2-44a9-84a7-589b12d00879'
        })

        it('correctly transform the "letter" notification into a "scheduled_notifications"', () => {
          const result = ScheduledNotificationPresenter.go(notification, journey)

          expect(result).to.equal({
            messageRef: 'returns_invitation_returns_to_letter',
            messageType: 'letter',
            personalisation: notification.options.personalisation
          })
        })
      })
    })
  })
})

function _email() {
  return {
    emailAddress: 'primary.user@important.com',
    options: {
      personalisation: {
        periodEndDate: '31 March 2025',
        periodStartDate: '1 January 2025',
        returnDueDate: '28 April 2025'
      },
      reference: 'TEST-123'
    },
    templateId: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f'
  }
}

function _letter() {
  return {
    options: {
      personalisation: {
        address_line_1: '1',
        address_line_2: 'Privet Drive',
        address_line_3: 'Little Whinging',
        address_line_4: 'Surrey',
        address_line_5: 'WD25 7LR',
        name: 'Mr H J Licence holder',
        periodEndDate: '31 March 2025',
        periodStartDate: '1 January 2025',
        returnDueDate: '28 April 2025'
      },
      reference: 'TEST-123'
    },
    templateId: '4fe80aed-c5dd-44c3-9044-d0289d635019'
  }
}
