'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ScheduledNotificationsUpdateNotifyPresenter = require('../../../../app/presenters/notifications/setup/scheduled-notification-update-notify.presenter.js')

describe('Notifications Setup - Scheduled notifications updates notify presenter', () => {
  let scheduledNotification
  let notifyResponse

  beforeEach(() => {
    scheduledNotification = { messageType: 'email' }

    notifyResponse = {
      id: '123',
      plaintext: 'My dearest margery',
      status: 201,
      statusText: 'created'
    }
  })

  it('correctly updates the scheduled notification with the notify data', () => {
    const result = ScheduledNotificationsUpdateNotifyPresenter.go(scheduledNotification, notifyResponse)

    expect(result).to.equal({
      messageType: 'email',
      notifyId: '123',
      notifyStatus: 'created',
      plaintext: 'My dearest margery',
      status: 'sent'
    })
  })

  describe('when there is an error', () => {
    beforeEach(() => {
      notifyResponse = {
        status: 400,
        message: 'Request failed with status code 400',
        errors: [
          {
            error: 'ValidationError',
            message: 'email_address Not a valid email address'
          }
        ]
      }
    })

    it('correctly updates the scheduled notification with the notify error', () => {
      const result = ScheduledNotificationsUpdateNotifyPresenter.go(scheduledNotification, notifyResponse)

      expect(result).to.equal({
        log: '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"ValidationError","message":"email_address Not a valid email address"}]}',
        messageType: 'email',
        status: 'error'
      })
    })
  })
})
