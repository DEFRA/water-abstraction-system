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
const NotifyEmailService = require('../../../app/services/notify/notify-email.service.js')

describe('Notify - Email service', () => {
  let emailAddress
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

    templateId = notifyTemplates.returns.invitations.primaryUserEmail
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the call to "notify" is successful', () => {
    beforeEach(() => {
      notifyStub = _stubSuccessfulNotify(stubNotify, {
        data: { id: '12345' },
        status: 201
      })
    })

    it('should call notify', async () => {
      const result = await NotifyEmailService.go(templateId, emailAddress, options)

      expect(result).to.equal({
        id: result.id,
        status: 201
      })
    })

    if (stubNotify) {
      it('should use the notify client', async () => {
        await NotifyEmailService.go(templateId, emailAddress, options)

        expect(notifyStub.calledWith(templateId, emailAddress, options)).to.equal(true)
      })
    }
  })

  describe('when the call to "notify" is unsuccessful', () => {
    describe('when notify returns a "client error"', () => {
      describe('because there is no "emailAddress"', () => {
        beforeEach(() => {
          emailAddress = ''

          notifyStub = _stubUnSuccessfulNotify(stubNotify, {
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
          const result = await NotifyEmailService.go(templateId, emailAddress, options)

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

          notifyStub = _stubUnSuccessfulNotify(stubNotify, {
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
          const result = await NotifyEmailService.go(templateId, emailAddress, options)

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

function _stubSuccessfulNotify(stub, response) {
  if (stub) {
    return Sinon.stub(NotifyClient.prototype, 'sendEmail').resolves(response)
  }
}

function _stubUnSuccessfulNotify(stub, response) {
  if (stub) {
    return Sinon.stub(NotifyClient.prototype, 'sendEmail').rejects(response)
  }
}
