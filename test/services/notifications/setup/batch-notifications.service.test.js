'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { NotifyClient } = require('notifications-node-client')
const { stubNotify } = require('../../../../config/notify.config.js')

// Things we need to stub

// Thing under test
const BatchNotificationsService = require('../../../../app/services/notifications/setup/batch-notifications.service.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')

describe.only('Notifications Setup - Batch notifications service', () => {
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

    it('correctly sends a letter data to notify', async () => {
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

    it('correctly creates a notification in the db', async () => {})

    it('correctly returns the success an failure count', async () => {})
  })
})

function _stubSuccessfulNotify(stub, response) {
  if (stub) {
    Sinon.stub(NotifyClient.prototype, 'sendEmail').resolves(response)
    Sinon.stub(NotifyClient.prototype, 'sendLetter').resolves(response)
  }
}
