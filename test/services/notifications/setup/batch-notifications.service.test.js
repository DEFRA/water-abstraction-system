'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const ScheduledNotificationModel = require('../../../../app/models/scheduled-notification.model.js')
const { stubNotify } = require('../../../../config/notify.config.js')

// Things we need to stub
const NotifyConfig = require('../../../../config/notify.config.js')
const { NotifyClient } = require('notifications-node-client')

// Thing under test
const BatchNotificationsService = require('../../../../app/services/notifications/setup/batch-notifications.service.js')

describe('Notifications Setup - Batch notifications service', () => {
  const ONE_HUNDRED_MILLISECONDS = 100
  const referenceCode = 'RINV-123'

  let determinedReturnsPeriod
  let eventId
  let journey
  let recipients
  let testRecipients

  beforeEach(async () => {
    // By setting the batch size to 1 we can prove that all the batches are run, as we should have all the scheduled
    // notifications still saved in the database regardless of batch size
    Sinon.stub(NotifyConfig, 'batchSize').value(1)
    // By setting the delay to 100ms we can keep the tests fast whilst assuring our batch mechanism is delaying
    // correctly, we do not want increase the timeout for the test as we want them to fail if a timeout occurs
    Sinon.stub(NotifyConfig, 'delay').value(ONE_HUNDRED_MILLISECONDS)

    determinedReturnsPeriod = {
      name: 'allYear',
      dueDate: '2025-04-28',
      endDate: '2023-03-31',
      summer: 'false',
      startDate: '2022-04-01'
    }

    journey = 'invitations'

    recipients = RecipientsFixture.recipients()

    testRecipients = [...Object.values(recipients)]

    const event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnsInvitation',
      referenceCode
    })

    eventId = event.id
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the batch is successful', () => {
    beforeEach(() => {
      _stubSuccessfulNotify({
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

    it('should persist the scheduled notifications', async () => {
      await BatchNotificationsService.go(testRecipients, determinedReturnsPeriod, referenceCode, journey, eventId)

      const result = await _getScheduledNotifications(eventId)

      const [firstMultiple, secondMultiple] = recipients.licenceHolderWithMultipleLicences.licence_refs.split(',')

      expect(result).to.equal([
        {
          id: result[0].id,
          recipient: 'primary.user@important.com',
          messageType: 'email',
          messageRef: 'returns_invitation_primary_user_email',
          personalisation: {
            periodEndDate: '31 March 2023',
            returnDueDate: '28 April 2025',
            periodStartDate: '1 April 2022'
          },
          sendAfter: result[0].sendAfter,
          status: 'sent',
          log: null,
          licences: [recipients.primaryUser.licence_refs],
          individualId: null,
          companyId: null,
          notifyId: '12345',
          notifyStatus: 'created',
          plaintext: 'My dearest margery',
          eventId,
          metadata: null,
          statusChecks: null,
          nextStatusCheck: null,
          notificationType: null,
          jobId: null,
          createdAt: result[0].createdAt
        },
        {
          id: result[1].id,
          recipient: 'returns.agent@important.com',
          messageType: 'email',
          messageRef: 'returns_invitation_returns_agent_email',
          personalisation: {
            periodEndDate: '31 March 2023',
            returnDueDate: '28 April 2025',
            periodStartDate: '1 April 2022'
          },
          sendAfter: result[1].sendAfter,
          status: 'sent',
          log: null,
          licences: [recipients.returnsAgent.licence_refs],
          individualId: null,
          companyId: null,
          notifyId: '12345',
          notifyStatus: 'created',
          plaintext: 'My dearest margery',
          eventId,
          metadata: null,
          statusChecks: null,
          nextStatusCheck: null,
          notificationType: null,
          jobId: null,
          createdAt: result[1].createdAt
        },
        {
          id: result[2].id,
          recipient: null,
          messageType: 'letter',
          messageRef: 'returns_invitation_licence_holder_letter',
          personalisation: {
            name: 'Mr H J Licence holder',
            periodEndDate: '31 March 2023',
            returnDueDate: '28 April 2025',
            address_line_1: '1',
            address_line_2: 'Privet Drive',
            address_line_3: 'Little Whinging',
            address_line_4: 'Surrey',
            address_line_5: 'WD25 7LR',
            periodStartDate: '1 April 2022'
          },
          sendAfter: result[2].sendAfter,
          status: 'sent',
          log: null,
          licences: [recipients.licenceHolder.licence_refs],
          individualId: null,
          companyId: null,
          notifyId: '12345',
          notifyStatus: 'created',
          plaintext: 'My dearest margery',
          eventId,
          metadata: null,
          statusChecks: null,
          nextStatusCheck: null,
          notificationType: null,
          jobId: null,
          createdAt: result[2].createdAt
        },
        {
          id: result[3].id,
          recipient: null,
          messageType: 'letter',
          messageRef: 'returns_invitation_returns_to_letter',
          personalisation: {
            name: 'Mr H J Returns to',
            periodEndDate: '31 March 2023',
            returnDueDate: '28 April 2025',
            address_line_1: '2',
            address_line_2: 'Privet Drive',
            address_line_3: 'Little Whinging',
            address_line_4: 'Surrey',
            address_line_5: 'WD25 7LR',
            periodStartDate: '1 April 2022'
          },
          sendAfter: result[3].sendAfter,
          status: 'sent',
          log: null,
          licences: [recipients.returnsTo.licence_refs],
          individualId: null,
          companyId: null,
          notifyId: '12345',
          notifyStatus: 'created',
          plaintext: 'My dearest margery',
          eventId,
          metadata: null,
          statusChecks: null,
          nextStatusCheck: null,
          notificationType: null,
          jobId: null,
          createdAt: result[3].createdAt
        },
        {
          id: result[4].id,
          recipient: null,
          messageType: 'letter',
          messageRef: 'returns_invitation_licence_holder_letter',
          personalisation: {
            name: 'Mr H J Licence holder with multiple licences',
            periodEndDate: '31 March 2023',
            returnDueDate: '28 April 2025',
            address_line_1: '3',
            address_line_2: 'Privet Drive',
            address_line_3: 'Little Whinging',
            address_line_4: 'Surrey',
            address_line_5: 'WD25 7LR',
            periodStartDate: '1 April 2022'
          },
          sendAfter: result[4].sendAfter,
          status: 'sent',
          log: null,
          licences: [firstMultiple, secondMultiple],
          individualId: null,
          companyId: null,
          notifyId: '12345',
          notifyStatus: 'created',
          plaintext: 'My dearest margery',
          eventId,
          metadata: null,
          statusChecks: null,
          nextStatusCheck: null,
          notificationType: null,
          jobId: null,
          createdAt: result[4].createdAt
        }
      ])
    })

    it('should return with no errors', async () => {
      const result = await BatchNotificationsService.go(
        testRecipients,
        determinedReturnsPeriod,
        referenceCode,
        journey,
        eventId
      )

      expect(result).to.equal({
        error: 0,
        sent: 5
      })
    })

    it('correctly sends the "email" data to Notify', async () => {
      await BatchNotificationsService.go(testRecipients, determinedReturnsPeriod, referenceCode, journey, eventId)

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

    it('correctly sends the "letter" data to Notify', async () => {
      await BatchNotificationsService.go(testRecipients, determinedReturnsPeriod, referenceCode, journey, eventId)

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
      _stubUnSuccessfulNotify({
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
      const result = await BatchNotificationsService.go(
        testRecipients,
        determinedReturnsPeriod,
        referenceCode,
        journey,
        eventId
      )

      expect(result).to.equal({
        error: 5,
        sent: 5
      })
    })

    it('should persist the scheduled notifications with the errors', async () => {
      await BatchNotificationsService.go(testRecipients, determinedReturnsPeriod, referenceCode, journey, eventId)

      const result = await _getScheduledNotifications(eventId)

      expect(result[0]).to.equal({
        id: result[0].id,
        recipient: 'primary.user@important.com',
        messageType: 'email',
        messageRef: 'returns_invitation_primary_user_email',
        personalisation: {
          periodEndDate: '31 March 2023',
          returnDueDate: '28 April 2025',
          periodStartDate: '1 April 2022'
        },
        sendAfter: result[0].sendAfter,
        status: 'error',
        log: '{"status":400,"message":"Request failed with status code 400","errors":[{"error":"ValidationError","message":"email_address Not a valid email address"}]}',
        licences: [recipients.primaryUser.licence_refs],
        individualId: null,
        companyId: null,
        notifyId: null,
        notifyStatus: null,
        plaintext: null,
        eventId,
        metadata: null,
        statusChecks: null,
        nextStatusCheck: null,
        notificationType: null,
        jobId: null,
        createdAt: result[0].createdAt
      })
    })
  })
})

async function _getScheduledNotifications(eventId) {
  return ScheduledNotificationModel.query().where('eventId', eventId)
}

function _stubSuccessfulNotify(response) {
  if (stubNotify) {
    Sinon.stub(NotifyClient.prototype, 'sendEmail').resolves(response)
    Sinon.stub(NotifyClient.prototype, 'sendLetter').resolves(response)
  }
}

function _stubUnSuccessfulNotify(response) {
  if (stubNotify) {
    Sinon.stub(NotifyClient.prototype, 'sendEmail').rejects(response)
    Sinon.stub(NotifyClient.prototype, 'sendLetter').rejects(response)
  }
}
