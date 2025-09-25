'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationModel = require('../../../../app/models/notification.model.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { notifyTemplates } = require('../../../../app/lib/notify-templates.lib.js')

// Things we need to stub
const CreateEmailRequest = require('../../../../app/requests/notify/create-email.request.js')
const CreateLetterRequest = require('../../../../app/requests/notify/create-letter.request.js')
const CreatePrecompiledFileRequest = require('../../../../app/requests/notify/create-precompiled-file.request.js')
const NotifyConfig = require('../../../../config/notify.config.js')
const ProcessNotificationStatusService = require('../../../../app/services/jobs/notification-status/process-notification-status.service.js')

// Thing under test
const BatchNotificationsService = require('../../../../app/services/notices/setup/batch-notifications.service.js')

describe('Notices - Setup - Batch Notifications service', () => {
  const ONE_HUNDRED_MILLISECONDS = 100

  let event
  let notifications
  let recipientsFixture
  let referenceCode
  let testNotification

  beforeEach(async () => {
    recipientsFixture = RecipientsFixture.recipients()

    referenceCode = generateReferenceCode()

    const notifyResponse = successfulNotifyResponses(referenceCode)

    Sinon.stub(CreateEmailRequest, 'send').onCall(0).resolves(notifyResponse.email)
    Sinon.stub(CreateLetterRequest, 'send').onCall(0).resolves(notifyResponse.letter)

    Sinon.stub(ProcessNotificationStatusService, 'go')

    // By setting the batch size to 1 we can prove that all the batches are run, as we should have all the notifications
    // still saved in the database regardless of batch size
    Sinon.stub(NotifyConfig, 'batchSize').value(1)
    // By setting the delay to 100ms we can keep the tests fast whilst assuring our batch mechanism is delaying
    // correctly, we do not want to increase the timeout for the test as we want them to fail if a timeout occurs
    Sinon.stub(NotifyConfig, 'delay').value(ONE_HUNDRED_MILLISECONDS)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when sending emails', () => {
    beforeEach(async () => {
      event = await EventHelper.add({
        metadata: {},
        licences: [recipientsFixture.primaryUser],
        referenceCode,
        status: 'completed',
        subtype: 'returnInvitation',
        type: 'notification'
      })

      testNotification = _notifications(event.id, [recipientsFixture.primaryUser.licence_refs])

      notifications = [testNotification.email]
    })

    it('should send and then save the notification', async () => {
      await BatchNotificationsService.go(notifications, event.id)

      // Confirm the notifications are created and Notify request recorded as expected
      const createdNotifications = await NotificationModel.query().where('eventId', event.id)

      expect(createdNotifications).to.equal([
        {
          createdAt: createdNotifications[0].createdAt,
          eventId: event.id,
          id: createdNotifications[0].id,
          licenceMonitoringStationId: null,
          licences: [recipientsFixture.primaryUser.licence_refs],
          messageRef: 'returns_invitation_primary_user_email',
          messageType: 'email',
          plaintext: 'Dear licence holder,\r\n',
          personalisation: {
            periodEndDate: '31 March 2023',
            returnDueDate: '28 April 2025',
            periodStartDate: '1 April 2022'
          },
          notifyError: null,
          notifyId: '9a0a0ba0-9dc7-4322-9a68-cb370220d0c9',
          notifyStatus: 'created',
          recipient: 'primary.user@important.com',
          returnLogIds: null,
          status: 'pending',
          templateId: null
        }
      ])
    })
  })

  describe('when sending letters', () => {
    beforeEach(async () => {
      event = await EventHelper.add({
        metadata: {},
        licences: [recipientsFixture.licenceHolder],
        referenceCode,
        status: 'completed',
        subtype: 'returnInvitation',
        type: 'notification'
      })

      testNotification = _notifications(event.id, [recipientsFixture.licenceHolder.licence_refs], referenceCode)

      notifications = [testNotification.letter]
    })

    it('should send and then save the notification', async () => {
      await BatchNotificationsService.go(notifications, event.id)

      // Confirm the notifications are created and Notify request recorded as expected
      const createdNotifications = await NotificationModel.query().where('eventId', event.id)

      expect(createdNotifications).to.equal([
        {
          createdAt: createdNotifications[0].createdAt,
          eventId: event.id,
          id: createdNotifications[0].id,
          licenceMonitoringStationId: null,
          licences: [recipientsFixture.licenceHolder.licence_refs],
          messageRef: 'returns_invitation_licence_holder_letter',
          messageType: 'letter',
          notifyError: null,
          notifyId: 'fff6c2a9-77fc-4553-8265-546109a45044',
          notifyStatus: 'created',
          personalisation: {
            address_line_1: 'Mr H J Licence holder',
            address_line_2: '1',
            address_line_3: 'Privet Drive',
            address_line_4: 'Little Whinging',
            address_line_5: 'Surrey',
            address_line_6: 'WD25 7LR',
            name: 'Mr H J Licence holder',
            periodEndDate: '31 March 2023',
            periodStartDate: '1 April 2022',
            returnDueDate: '28 April 2025'
          },
          plaintext: 'Dear Licence holder,\r\n',
          recipient: null,
          returnLogIds: null,
          status: 'pending',
          templateId: null
        }
      ])
    })
  })

  describe('when sending PDFs', () => {
    beforeEach(async () => {
      referenceCode = generateReferenceCode('PRTF')

      event = await EventHelper.add({
        metadata: {},
        licences: [recipientsFixture.licenceHolder],
        referenceCode,
        status: 'completed',
        subtype: 'paperReturnForms',
        type: 'notification'
      })

      testNotification = _notifications(event.id, [recipientsFixture.licenceHolder.licence_refs])

      notifications = [testNotification.pdf]

      const notifyResponse = successfulNotifyResponses(referenceCode)

      Sinon.stub(CreatePrecompiledFileRequest, 'send').onCall(0).resolves(notifyResponse.pdf)
    })

    it('should send and then save the notification', async () => {
      await BatchNotificationsService.go(notifications, event.id)

      // Confirm the notifications are created and Notify request recorded as expected
      const createdNotifications = await NotificationModel.query().where('eventId', event.id)

      expect(createdNotifications).to.equal([
        {
          createdAt: createdNotifications[0].createdAt,
          eventId: event.id,
          id: createdNotifications[0].id,
          licenceMonitoringStationId: null,
          licences: [recipientsFixture.licenceHolder.licence_refs],
          messageRef: 'pdf.return_form',
          messageType: 'letter',
          plaintext: null,
          personalisation: { name: 'Red 5' },
          notifyError: null,
          notifyId: 'fff6c2a9-77fc-4553-8265-546109a45044',
          notifyStatus: 'created',
          recipient: null,
          returnLogIds: testNotification.pdf.returnLogIds,
          status: 'pending',
          templateId: null
        }
      ])
    })
  })

  describe('when a the batch process has finished', () => {
    beforeEach(() => {
      const testNotification = _notifications(event.id, [recipientsFixture.primaryUser.licence_refs])

      notifications = [testNotification.email]
    })

    describe('and there are no errors', () => {
      beforeEach(async () => {
        event = await EventHelper.add({
          metadata: {},
          licences: [recipientsFixture.primaryUser],
          referenceCode,
          status: 'completed',
          subtype: 'returnInvitation',
          type: 'notification'
        })
      })

      it('should not affect the error count', async () => {
        await BatchNotificationsService.go(notifications, event.id)

        const refreshedEvent = await event.$query()

        expect(refreshedEvent).to.equal({
          createdAt: event.createdAt,
          entities: null,
          id: event.id,
          issuer: 'test.user@defra.gov.uk',
          licences: event.licences,
          metadata: { error: 0 },
          referenceCode,
          status: 'completed',
          subtype: 'returnInvitation',
          type: 'notification',
          updatedAt: refreshedEvent.updatedAt
        })
      })
    })

    describe('and there are existing errors', () => {
      beforeEach(async () => {
        event = await EventHelper.add({
          metadata: { error: 5 },
          licences: [recipientsFixture.primaryUser],
          referenceCode,
          status: 'completed',
          subtype: 'returnInvitation',
          type: 'notification'
        })
      })

      it('should increment the error count', async () => {
        await BatchNotificationsService.go(notifications, event.id)

        const refreshedEvent = await event.$query()

        expect(refreshedEvent).to.equal({
          createdAt: event.createdAt,
          entities: null,
          id: event.id,
          issuer: 'test.user@defra.gov.uk',
          licences: event.licences,
          metadata: { error: 5 },
          referenceCode,
          status: 'completed',
          subtype: 'returnInvitation',
          type: 'notification',
          updatedAt: refreshedEvent.updatedAt
        })
      })
    })
  })
})

function successfulNotifyResponses(referenceCode) {
  return {
    email: {
      succeeded: true,
      response: {
        statusCode: 200,
        body: {
          content: {
            body: 'Dear licence holder,\r\n',
            from_email: 'environment.agency.water.resources.licensing.service@notifications.service.gov.uk',
            one_click_unsubscribe_url: null,
            subject: 'Submit your water abstraction returns by 28th April 2025'
          },
          id: '9a0a0ba0-9dc7-4322-9a68-cb370220d0c9',
          reference: referenceCode,
          scheduled_for: null,
          template: {
            id: notifyTemplates.standard.invitations.returnsAgentEmail,
            uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${notifyTemplates.standard.invitations.returnsAgentEmail}`,
            version: 40
          },
          uri: 'https://api.notifications.service.gov.uk/v2/notifications/9a0a0ba0-9dc7-4322-9a68-cb370220d0c9'
        }
      }
    },
    letter: {
      succeeded: true,
      response: {
        statusCode: 200,
        body: {
          content: {
            body: 'Dear Licence holder,\r\n',
            subject: 'Submit your water abstraction returns by 28th April 2025'
          },
          id: 'fff6c2a9-77fc-4553-8265-546109a45044',
          reference: referenceCode,
          scheduled_for: null,
          template: {
            id: notifyTemplates.standard.invitations.licenceHolderLetter,
            uri: `https://api.notifications.service.gov.uk/services/2232718f-fc58-4413-9e41-135496648da7/templates/${notifyTemplates.standard.invitations.licenceHolderLetter}`,
            version: 32
          },
          uri: 'https://api.notifications.service.gov.uk/v2/notifications/fff6c2a9-77fc-4553-8265-546109a45044'
        }
      }
    },
    pdf: {
      succeeded: true,
      response: {
        statusCode: 200,
        body: {
          id: 'fff6c2a9-77fc-4553-8265-546109a45044',
          reference: referenceCode
        }
      }
    }
  }
}

function _notifications(eventId, licences) {
  const date = new Date('2024-01-01')

  return {
    email: {
      createdAt: date,
      eventId,
      licences,
      messageRef: 'returns_invitation_primary_user_email',
      messageType: 'email',
      personalisation: {
        periodEndDate: '31 March 2023',
        returnDueDate: '28 April 2025',
        periodStartDate: '1 April 2022'
      },
      recipient: 'primary.user@important.com',
      templateId: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f'
    },
    letter: {
      createdAt: date,
      eventId,
      licences,
      messageRef: 'returns_invitation_licence_holder_letter',
      messageType: 'letter',
      personalisation: {
        name: 'Mr H J Licence holder',
        periodEndDate: '31 March 2023',
        returnDueDate: '28 April 2025',
        address_line_1: 'Mr H J Licence holder',
        address_line_2: '1',
        address_line_3: 'Privet Drive',
        address_line_4: 'Little Whinging',
        address_line_5: 'Surrey',
        address_line_6: 'WD25 7LR',
        periodStartDate: '1 April 2022'
      },
      recipient: null,
      templateId: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f'
    },
    pdf: {
      content: new TextEncoder().encode('mock file').buffer,
      eventId,
      licences,
      messageRef: 'pdf.return_form',
      messageType: 'letter',
      personalisation: { name: 'Red 5' },
      returnLogIds: [generateUUID()]
    }
  }
}
