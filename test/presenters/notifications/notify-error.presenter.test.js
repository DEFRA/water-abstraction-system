'use strict'

// Thing under test
const NotifyErrorPresenter = require('../../../app/presenters/notifications/notify-error.presenter.js')

describe('Notifications - Notify Error presenter', () => {
  let message
  let errors
  let statusCode

  beforeEach(() => {
    message = 'An error occurred'
    errors = ['a specific error']
    statusCode = 'ENOTFOUND'
  })

  it('correctly returns an errored notification', () => {
    const result = NotifyErrorPresenter(statusCode, message, errors)

    expect(result).toEqual({
      notifyError: '{"status":"ENOTFOUND","message":"An error occurred","errors":["a specific error"]}',
      status: 'error'
    })
  })
})
