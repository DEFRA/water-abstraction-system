'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { stubNotify } = require('../../../../config/notify.config.js')

// Things we need to stub
const { NotifyClient } = require('notifications-node-client')

// Thing under test
const BatchNotificationsService = require('../../../../app/services/notifications/setup/batch-notifications.service.js')

describe('Notifications Setup - Batch notifications service', () => {
  let determinedReturnsPeriod
  let journey
  let recipients
  let referenceCode
  let testRecipients

  beforeEach(() => {
    determinedReturnsPeriod = {
      name: 'allYear',
      dueDate: '2025-04-28',
      endDate: '2023-03-31',
      summer: 'false',
      startDate: '2022-04-01'
    }

    journey = 'invitations'
    referenceCode = 'RINV-123'

    recipients = RecipientsFixture.recipients()

    testRecipients = [...Object.values(recipients)]
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the batch is successful', () => {
    beforeEach(() => {
      _stubSuccessfulNotify(stubNotify, {
        data: { id: '12345' },
        status: 201
      })
    })

    it('should return with no errors', async () => {
      const result = await BatchNotificationsService.go(testRecipients, determinedReturnsPeriod, referenceCode, journey)

      expect(result).to.equal({
        error: 0,
        sent: 5
      })
    })

    it('correctly sends an "email" data to notify', async () => {
      await BatchNotificationsService.go(testRecipients, determinedReturnsPeriod, referenceCode, journey)

      expect(
        NotifyClient.prototype.sendEmail.calledWith(
          '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f',
          'primary.user@important.com',
          {
            personalisation: {
              periodEndDate: '31 March 2023',
              periodStartDate: '1 April 2022',
              returnDueDate: '28 April 2025'
            },
            reference: 'RINV-123'
          }
        )
      ).to.be.true()
    })

    it('correctly sends a "letter" data to notify', async () => {
      await BatchNotificationsService.go(testRecipients, determinedReturnsPeriod, referenceCode, journey)

      expect(
        NotifyClient.prototype.sendLetter.calledWith('4fe80aed-c5dd-44c3-9044-d0289d635019', {
          personalisation: {
            address_line_1: '1',
            address_line_2: 'Privet Drive',
            address_line_3: 'Little Whinging',
            address_line_4: 'Surrey',
            address_line_5: 'WD25 7LR',
            name: 'Mr H J Licence holder',
            periodEndDate: '31 March 2023',
            periodStartDate: '1 April 2022',
            returnDueDate: '28 April 2025'
          },
          reference: 'RINV-123'
        })
      ).to.be.true()
    })
  })

  describe('when a call to "notify" is unsuccessful', () => {
    beforeEach(() => {
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

    it('should return the "error" count in the response', async () => {
      const result = await BatchNotificationsService.go(testRecipients, determinedReturnsPeriod, referenceCode, journey)

      expect(result).to.equal({
        error: 5,
        sent: 5
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
