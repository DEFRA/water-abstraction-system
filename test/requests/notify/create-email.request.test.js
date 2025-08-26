'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { notifyTemplates } = require('../../../app/lib/notify-templates.lib.js')

// Things we need to stub
const NotifyRequest = require('../../../app/requests/notify.request.js')

// Thing under test
const CreateEmailRequest = require('../../../app/requests/notify/create-email.request.js')

describe('Notify - Create Email request', () => {
  let emailAddress
  let options
  let response
  let templateId

  beforeEach(() => {
    emailAddress = 'hello@example.com'

    options = {
      personalisation: {
        periodEndDate: '28th January 2025',
        periodStartDate: '1st January 2025',
        returnDueDate: '28th April 2025'
      },
      reference: 'RINV-H1EZR5'
    }

    templateId = notifyTemplates.standard.invitations.primaryUserEmail
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        statusCode: 200,
        body: {
          content: {
            body: 'Dear licence holder,\r\n',
            from_email: 'environment.agency.water.resources.licensing.service@notifications.service.gov.uk',
            one_click_unsubscribe_url: null,
            subject: 'Submit your water abstraction returns by 28th April 2025'
          },
          id: 'a8023182-5cb3-4ee3-b777-2fb82cde7fc5',
          reference: options.reference,
          scheduled_for: null,
          template: {
            id: templateId,
            uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${templateId}`,
            version: 40
          },
          uri: 'https://api.notifications.service.gov.uk/v2/notifications/a8023182-5cb3-4ee3-b777-2fb82cde7fc5'
        }
      }

      Sinon.stub(NotifyRequest, 'post').resolves({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await CreateEmailRequest.send(templateId, emailAddress, options)

      expect(result.succeeded).to.be.true()
    })

    it('returns the result from Notify in the "response"', async () => {
      const result = await CreateEmailRequest.send(templateId, emailAddress, options)

      expect(result.response.body).to.equal(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          statusCode: 400,
          body: {
            errors: [
              {
                error: 'BadRequestError',
                message: 'Missing personalisation: returnDueDate'
              }
            ],
            status_code: 400
          }
        }

        Sinon.stub(NotifyRequest, 'post').resolves({
          succeeded: false,
          response
        })
      })

      it('returns a "false" success status', async () => {
        const result = await CreateEmailRequest.send(templateId, emailAddress, options)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await CreateEmailRequest.send(templateId, emailAddress, options)

        expect(result.response.body).to.equal(response.body)
      })
    })
  })
})
