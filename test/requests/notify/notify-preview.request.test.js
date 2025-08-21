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
const NotifyPreviewRequest = require('../../../app/requests/notify/notify-preview.request.js')

describe('Notify - Notify Preview request', () => {
  let personalisation
  let response
  let templateId

  beforeEach(() => {
    personalisation = {
      periodEndDate: '28th January 2025',
      periodStartDate: '1st January 2025',
      returnDueDate: '28th April 2025'
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
          body: 'Dear licence holder,\r\n',
          html: '"<p style="Margin: 0 0 20px 0; font-size: 19px; line-height: 25px; color: #0B0C0C;">Dear licence holder,</p>',
          id: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f',
          postage: null,
          subject: 'Submit your water abstraction returns by 28th April 2025',
          type: 'email',
          version: 40
        }
      }

      Sinon.stub(NotifyRequest, 'post').resolves({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await NotifyPreviewRequest.send(templateId, personalisation)

      expect(result.succeeded).to.be.true()
    })

    it('returns the result from Notify in the "response"', async () => {
      const result = await NotifyPreviewRequest.send(templateId, personalisation)

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
        const result = await NotifyPreviewRequest.send(templateId, personalisation)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await NotifyPreviewRequest.send(templateId, personalisation)

        expect(result.response.body).to.equal(response.body)
      })
    })
  })
})
