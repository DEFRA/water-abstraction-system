'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NotificationErrorPresenter = require('../../../../app/presenters/notices/setup/notification-error.presenter.js')

describe('Notices - Setup - Notification Error presenter', () => {
  let message
  let errors
  let statusCode

  beforeEach(() => {
    message = 'An error occurred'
    errors = ['a specific error']
    statusCode = 'ENOTFOUND'
  })

  it('correctly returns notification', () => {
    const result = NotificationErrorPresenter.go(statusCode, message, errors)

    expect(result).to.equal({
      notifyError: '{"status":"ENOTFOUND","message":"An error occurred","errors":["a specific error"]}',
      status: 'error'
    })
  })
})
