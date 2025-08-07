'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { NotifyClient } = require('notifications-node-client')
const { notifyTemplates } = require('../../../app/lib/notify-templates.lib.js')
const { stubNotify } = require('../../../config/notify.config.js')

// Thing under test
const NotifyEmailRequest = require('../../../app/requests/notify/notify-email.request.js')

describe('Notify - Email request', () => {
  let emailAddress
  let notifierStub
  let notifyStub
  let options
  let templateId

  beforeEach(() => {
    // To test a real email is delivered replace this with an email on the whitelist (and use the whitelist api key)
    emailAddress = 'hello@example.com'

    options = {
      personalisation: {
        periodEndDate: '28th January 2025',
        periodStartDate: '1st January 2025',
        returnDueDate: '28th April 2025'
      },
      reference: 'developer-testing'
    }

    templateId = notifyTemplates.standard.invitations.primaryUserEmail

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the call to "notify" is successful', () => {
    beforeEach(() => {
      notifyStub = _stubSuccessfulNotify({
        data: {
          id: '12345',
          content: {
            body: 'My dearest margery'
          }
        },
        status: 201,
        statusText: 'CREATED'
      })
    })

    it('should call notify', async () => {
      const result = await NotifyEmailRequest.send(templateId, emailAddress, options)

      expect(result).to.equal({
        id: result.id,
        plaintext: 'My dearest margery',
        status: 201,
        statusText: 'created'
      })
    })

    if (stubNotify) {
      it('should use the notify client', async () => {
        await NotifyEmailRequest.send(templateId, emailAddress, options)

        expect(notifyStub.calledWith(templateId, emailAddress, options)).to.equal(true)
      })
    }
  })

  describe('when the call to "notify" is unsuccessful', () => {
    describe('when notify returns a "client error"', () => {
      describe('because there is no "emailAddress"', () => {
        beforeEach(() => {
          emailAddress = ''

          notifyStub = _stubUnSuccessfulNotify({
            status: 400,
            message: 'Request failed with status code 400',
            response: {
              data: {
                errors: [
                  {
                    error: 'ValidationError',
                    message: 'email_address Not a valid email address'
                  }
                ]
              }
            }
          })
        })

        it('should return an error', async () => {
          const result = await NotifyEmailRequest.send(templateId, emailAddress, options)

          expect(result).to.equal({
            status: 400,
            message: 'Request failed with status code 400',
            errors: [
              {
                error: 'ValidationError',
                message: 'email_address Not a valid email address'
              }
            ]
          })
        })
      })

      describe('because a "placeholder" has not been provided through "personalisation', () => {
        beforeEach(() => {
          delete options.personalisation.periodEndDate

          notifyStub = _stubUnSuccessfulNotify({
            status: 400,
            message: 'Request failed with status code 400',
            response: {
              data: {
                errors: [
                  {
                    error: 'BadRequestError',
                    message: 'Missing personalisation: periodEndDate'
                  }
                ]
              }
            }
          })
        })

        it('should return an error', async () => {
          const result = await NotifyEmailRequest.send(templateId, emailAddress, options)

          expect(result).to.equal({
            status: 400,
            message: 'Request failed with status code 400',
            errors: [
              {
                error: 'BadRequestError',
                message: 'Missing personalisation: periodEndDate'
              }
            ]
          })
        })
      })
    })
  })
})

function _stubSuccessfulNotify(response) {
  if (stubNotify) {
    return Sinon.stub(NotifyClient.prototype, 'sendEmail').resolves(response)
  }
}

function _stubUnSuccessfulNotify(response) {
  if (stubNotify) {
    return Sinon.stub(NotifyClient.prototype, 'sendEmail').rejects(response)
  }
}
