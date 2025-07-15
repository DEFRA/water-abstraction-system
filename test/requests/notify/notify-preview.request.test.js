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

// Thing under test
const NotifyPreviewRequest = require('../../../app/requests/notify/notify-preview.request.js')

describe('Notify - Letter request', () => {
  let notifierStub
  let notifyStub
  let personalisation
  let templateId

  beforeEach(() => {
    personalisation = {
      address_line_1: 'Amala Bird',
      address_line_2: '123 High Street',
      address_line_3: 'Richmond upon Thames',
      address_line_4: 'Middlesex',
      address_line_5: 'SW14 6BF',
      name: 'A Person',
      periodEndDate: '28th January 2025',
      periodStartDate: '1st January 2025',
      returnDueDate: '28th April 2025'
    }

    templateId = notifyTemplates.standard.invitations.licenceHolderLetter

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
          body: 'My dearest margery'
        },
        status: 200,
        statusText: 'OK'
      })
    })

    it('should call notify', async () => {
      const result = await NotifyPreviewRequest.send(templateId, personalisation)

      expect(result).to.equal({
        id: result.id,
        plaintext: 'My dearest margery',
        status: 200,
        statusText: 'ok'
      })
    })

    it('should use the notify client', async () => {
      await NotifyPreviewRequest.send(templateId, personalisation)

      expect(notifyStub.calledWith(templateId, personalisation)).to.equal(true)
    })
  })

  describe('when the call to "notify" is unsuccessful', () => {
    describe('because the template id is invalid', () => {
      beforeEach(() => {
        templateId = 'invalid-template-id'

        notifyStub = _stubUnSuccessfulNotify({
          status: 400,
          message: 'Request failed with status code 400',
          response: {
            data: {
              errors: [
                {
                  error: 'ValidationError',
                  message: 'id is not a valid UUID'
                }
              ]
            }
          }
        })
      })

      it('should return an error', async () => {
        const result = await NotifyPreviewRequest.send(templateId, personalisation)

        expect(result).to.equal({
          status: 400,
          message: 'Request failed with status code 400',
          errors: [
            {
              error: 'ValidationError',
              message: 'id is not a valid UUID'
            }
          ]
        })
      })
    })
  })
})

function _stubSuccessfulNotify(response) {
  return Sinon.stub(NotifyClient.prototype, 'previewTemplateById').resolves(response)
}

function _stubUnSuccessfulNotify(response) {
  return Sinon.stub(NotifyClient.prototype, 'previewTemplateById').rejects(response)
}
