'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NotifyUpdatePresenter = require('../../../../app/presenters/notifications/setup/notify-update.presenter.js')

describe('Notifications Setup - Notify update presenter', () => {
  let notifyResponse

  beforeEach(() => {
    notifyResponse = {
      id: '123',
      plaintext: 'My dearest margery',
      status: 201,
      statusText: 'created'
    }
  })

  it('correctly returns notify data', () => {
    const result = NotifyUpdatePresenter.go(notifyResponse)

    expect(result).to.equal({
      notifyId: '123',
      notifyStatus: 'created',
      plaintext: 'My dearest margery',
      status: 'pending'
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

    it('correctly returns notify data with the error', () => {
      const result = NotifyUpdatePresenter.go(notifyResponse)

      expect(result).to.equal({
        log: '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"ValidationError","message":"email_address Not a valid email address"}]}',
        status: 'error'
      })
    })
  })
})
