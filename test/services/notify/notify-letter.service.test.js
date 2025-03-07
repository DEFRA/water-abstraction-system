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
const NotifyLetterService = require('../../../app/services/notify/notify-letter.service.js')

describe('Notify - Letter service', () => {
  let notifyStub
  let options
  let templateId

  beforeEach(() => {
    options = {
      personalisation: {
        address_line_1: 'Amala Bird', // required string
        address_line_2: '123 High Street', // required string
        address_line_3: 'Richmond upon Thames', // required string
        address_line_4: 'Middlesex',
        address_line_5: 'SW14 6BF', // last line of address you include must be a postcode or a country name  outside the UK
        name: 'A Person',
        periodEndDate: '28th January 2025',
        periodStartDate: '1st January 2025',
        returnDueDate: '28th April 2025'
      },
      reference: 'developer-testing'
    }

    templateId = notifyTemplates.returns.invitations.licenceHolderLetter
  })

  afterEach(() => {
    Sinon.restore()
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
      const result = await NotifyLetterService.go(templateId, options)

      expect(result).to.equal({
        id: result.id,
        plaintext: 'My dearest margery',
        status: 201,
        statusText: 'created'
      })
    })

    if (stubNotify) {
      it('should use the notify client', async () => {
        await NotifyLetterService.go(templateId, options)

        expect(notifyStub.calledWith(templateId, options)).to.equal(true)
      })
    }
  })

  describe('when the call to "notify" is unsuccessful', () => {
    describe('when notify returns a "client error"', () => {
      describe('because a "address" has not been provided', () => {
        beforeEach(() => {
          delete options.personalisation.address_line_1
          delete options.personalisation.address_line_2
          delete options.personalisation.address_line_3
          delete options.personalisation.address_line_4
          delete options.personalisation.address_line_5

          notifyStub = _stubUnSuccessfulNotify({
            status: 400,
            message: 'Request failed with status code 400',
            response: {
              data: {
                errors: [
                  {
                    error: 'ValidationError',
                    message: 'Address must be at least 3 lines'
                  }
                ]
              }
            }
          })
        })

        it('should return an error', async () => {
          const result = await NotifyLetterService.go(templateId, options)

          expect(result).to.equal({
            status: 400,
            message: 'Request failed with status code 400',
            errors: [
              {
                error: 'ValidationError',
                message: 'Address must be at least 3 lines'
              }
            ]
          })
        })
      })

      describe('because a "placeholder" has not been provided through "personalisation', () => {
        beforeEach(() => {
          delete options.personalisation.name

          notifyStub = _stubUnSuccessfulNotify({
            status: 400,
            message: 'Request failed with status code 400',
            response: {
              data: {
                errors: [
                  {
                    error: 'BadRequestError',
                    message: 'Missing personalisation: name'
                  }
                ]
              }
            }
          })
        })

        it('should return an error', async () => {
          const result = await NotifyLetterService.go(templateId, options)

          expect(result).to.equal({
            status: 400,
            message: 'Request failed with status code 400',
            errors: [
              {
                error: 'BadRequestError',
                message: 'Missing personalisation: name'
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
    return Sinon.stub(NotifyClient.prototype, 'sendLetter').resolves(response)
  }
}

function _stubUnSuccessfulNotify(response) {
  if (stubNotify) {
    return Sinon.stub(NotifyClient.prototype, 'sendLetter').rejects(response)
  }
}
