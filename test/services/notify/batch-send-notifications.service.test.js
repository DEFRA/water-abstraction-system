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
const BatchSendNotificationsService = require('../../../app/services/notify/batch-send-notifications.service.js')

describe.only('Notify - Batch send notifications service', () => {
  let emailAddress
  let options
  let recipients

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

    // Determined recipients
    recipients = [
      {
        contact: null,
        contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
        contact_type: 'Primary user',
        email: 'primary.user@important.com',
        licence_refs: '456',
        message_type: 'Email'
      },
      {
        contact: {
          addressLine1: '1',
          addressLine2: 'Privet Drive',
          addressLine3: null,
          addressLine4: null,
          country: null,
          county: 'Surrey',
          forename: 'Harry',
          initials: 'H J',
          name: 'Licence holder',
          postcode: 'WD25 7LR',
          role: 'Licence holder',
          salutation: 'Mr',
          town: 'Little Whinging',
          type: 'Person'
        },
        contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
        contact_type: 'Licence holder',
        email: null,
        licence_refs: '123',
        message_type: 'Letter'
      }
    ]
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the call to "notify" is successful', () => {
    beforeEach(() => {
      _stubSuccessfulNotify(stubNotify, {
        data: { id: '12345' },
        status: 201
      })
    })

    it('should call notify', { timeout: 120000 }, async () => {
      const result = await BatchSendNotificationsService.go(recipients)

      expect(result).to.equal([
        // Email
        {
          contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
          id: '12345',
          status: 201,
          personalisation: {
            periodEndDate: '28th January 2025',
            periodStartDate: '1st January 2025',
            returnDueDate: '28th April 2025'
          }
        },
        // Letter
        {
          contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
          id: '12345',
          status: 201,
          personalisation: {
            address_line_1: '1',
            address_line_2: 'Privet Drive',
            address_line_3: 'Little Whinging',
            address_line_4: 'Surrey',
            address_line_5: 'WD25 7LR',
            name: 'Mr H J Licence holder',
            periodEndDate: '28th January 2025',
            periodStartDate: '1st January 2025',
            returnDueDate: '28th April 2025'
          }
        }
      ])
    })
  })

  describe('when the call to "notify" is unsuccessful', () => {
    describe('when notify returns a "client error"', () => {
      describe('because there is no "emailAddress"', () => {
        beforeEach(() => {
          emailAddress = ''

          _stubUnSuccessfulNotify(stubNotify, {
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
          const result = await BatchSendNotificationsService.go(recipients)

          expect(result).to.equal([
            {
              contact_hash_id: '90129f6aa5bf2ad50aa3fefd3f8cf86a',
              id: undefined,
              personalisation: {
                periodEndDate: '28th January 2025',
                periodStartDate: '1st January 2025',
                returnDueDate: '28th April 2025'
              },
              status: 400
            },
            {
              contact_hash_id: '22f6457b6be9fd63d8a9a8dd2ed61214',
              id: undefined,
              personalisation: {
                address_line_1: '1',
                address_line_2: 'Privet Drive',
                address_line_3: 'Little Whinging',
                address_line_4: 'Surrey',
                address_line_5: 'WD25 7LR',
                name: 'Mr H J Licence holder',
                periodEndDate: '28th January 2025',
                periodStartDate: '1st January 2025',
                returnDueDate: '28th April 2025'
              },
              status: 400
            }
          ])
        })
      })
    })
  })
})

function _stubSuccessfulNotify(stub, response) {
  if (stub) {
    Sinon.stub(NotifyClient.prototype, 'sendEmail').resolves(response)
    Sinon.stub(NotifyClient.prototype, 'sendLetter').resolves(response)
  }
}

function _stubUnSuccessfulNotify(stub, response) {
  if (stub) {
    Sinon.stub(NotifyClient.prototype, 'sendEmail').rejects(response)
    Sinon.stub(NotifyClient.prototype, 'sendLetter').rejects(response)
  }
}
