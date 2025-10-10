'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')
const NotificationModel = require('../../../../app/models/notification.model.js')
const NotifyResponseFixture = require('../../../fixtures/notify-response.fixture.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const CreateEmailRequest = require('../../../../app/requests/notify/create-email.request.js')
const CreateLetterRequest = require('../../../../app/requests/notify/create-letter.request.js')
const CreatePrecompiledFileRequest = require('../../../../app/requests/notify/create-precompiled-file.request.js')
const NotifyConfig = require('../../../../config/notify.config.js')
const PreparePaperReturnService = require('../../../../app/services/notices/setup/prepare-paper-return.service.js')
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

    const notifyResponse = NotifyResponseFixture.successfulResponse(referenceCode)

    const buffer = Buffer.from('mock file')

    event = await EventHelper.add({
      referenceCode
    })

    Sinon.stub(CreateEmailRequest, 'send').onCall(0).resolves(notifyResponse.email)
    Sinon.stub(CreateLetterRequest, 'send').onCall(0).resolves(notifyResponse.letter)
    Sinon.stub(PreparePaperReturnService, 'go').resolves({
      succeeded: true,
      response: { body: buffer }
    })
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
      const notification = _notifications(event.id, [recipientsFixture.primaryUser.licence_refs])

      testNotification = await NotificationHelper.add(notification.email)

      notifications = [testNotification]
    })

    it('should send and then save the notification', async () => {
      await BatchNotificationsService.go(notifications, event, referenceCode)

      // Confirm the notifications are updated and Notify request recorded as expected
      const updatedNotifications = await NotificationModel.query().where('eventId', event.id)

      expect(updatedNotifications).to.equal([
        {
          createdAt: testNotification.createdAt,
          eventId: event.id,
          id: testNotification.id,
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
          pdf: null,
          recipient: 'primary.user@important.com',
          returnedAt: null,
          returnLogIds: null,
          status: 'pending',
          templateId: testNotification.templateId
        }
      ])
    })
  })

  describe('when sending letters', () => {
    beforeEach(async () => {
      const notification = _notifications(event.id, [recipientsFixture.licenceHolder.licence_refs], referenceCode)

      testNotification = await NotificationHelper.add(notification.letter)

      notifications = [testNotification]
    })

    it('should send and then save the notification', async () => {
      await BatchNotificationsService.go(notifications, event, referenceCode)

      // Confirm the notifications are updated and Notify request recorded as expected
      const updatedNotifications = await NotificationModel.query().where('eventId', event.id)

      expect(updatedNotifications).to.equal([
        {
          createdAt: testNotification.createdAt,
          eventId: event.id,
          id: testNotification.id,
          licenceMonitoringStationId: null,
          licences: [recipientsFixture.licenceHolder.licence_refs],
          messageRef: 'returns_invitation_licence_holder_letter',
          messageType: 'letter',
          notifyError: null,
          notifyId: 'fff6c2a9-77fc-4553-8265-546109a45044',
          notifyStatus: 'created',
          pdf: null,
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
          returnedAt: null,
          returnLogIds: null,
          status: 'pending',
          templateId: testNotification.templateId
        }
      ])
    })
  })

  describe('when sending PDFs', { timeout: 5000 }, () => {
    let notification

    beforeEach(async () => {
      event = await EventHelper.add({
        referenceCode,
        subtype: 'paperReturnForms'
      })

      referenceCode = generateReferenceCode('PRTF')

      notification = _notifications(event.id, [recipientsFixture.licenceHolder.licence_refs])

      testNotification = await NotificationHelper.add({
        ...notification.pdf,
        pdf: null
      })

      notifications = [testNotification]

      const notifyResponse = NotifyResponseFixture.successfulResponse(referenceCode)

      Sinon.stub(CreatePrecompiledFileRequest, 'send').onCall(0).resolves(notifyResponse.pdf)
    })

    it('should send and then save the notification', async () => {
      await BatchNotificationsService.go(notifications, event, referenceCode)

      // Confirm the notifications are updated and Notify request recorded as expected
      const updatedNotifications = await NotificationModel.query().where('eventId', event.id)

      expect(updatedNotifications).to.equal([
        {
          createdAt: testNotification.createdAt,
          eventId: event.id,
          id: testNotification.id,
          licenceMonitoringStationId: null,
          licences: [recipientsFixture.licenceHolder.licence_refs],
          messageRef: 'pdf.return_form',
          messageType: 'letter',
          plaintext: null,
          personalisation: { name: 'Red 5' },
          notifyError: null,
          notifyId: 'fff6c2a9-77fc-4553-8265-546109a45044',
          notifyStatus: 'created',
          pdf: Buffer.from(notification.pdf.pdf),
          recipient: null,
          returnedAt: null,
          returnLogIds: testNotification.returnLogIds,
          status: 'pending',
          templateId: null
        }
      ])
    })
  })

  describe('when a the batch process has finished', () => {
    beforeEach(async () => {
      const notification = _notifications(event.id, [recipientsFixture.primaryUser.licence_refs])

      testNotification = await NotificationHelper.add(notification.email)

      notifications = [testNotification]
    })

    describe('and there are no errors', () => {
      beforeEach(async () => {
        event = await EventHelper.add({
          metadata: { error: 0 },
          licences: [recipientsFixture.primaryUser],
          referenceCode,
          status: 'completed',
          subtype: 'returnInvitation',
          type: 'notification'
        })
      })

      it('should not affect the error count', async () => {
        await BatchNotificationsService.go(notifications, event, referenceCode)

        const refreshedEvent = await event.$query()

        expect(refreshedEvent).to.equal({
          createdAt: event.createdAt,
          entities: null,
          id: event.id,
          issuer: 'test.user@defra.gov.uk',
          licences: event.licences,
          metadata: { error: 0 },
          overallStatus: null,
          referenceCode,
          status: 'completed',
          statusCounts: null,
          subtype: 'returnInvitation',
          type: 'notification',
          updatedAt: refreshedEvent.updatedAt
        })
      })
    })

    describe('and there are errors', () => {
      beforeEach(async () => {
        event = await EventHelper.add({
          metadata: { error: 0 },
          licences: [recipientsFixture.primaryUser],
          referenceCode,
          status: 'completed',
          subtype: 'returnInvitation',
          type: 'notification'
        })

        await NotificationHelper.add({ eventId: event.id, status: 'error' })
      })

      it('should count the error', async () => {
        await BatchNotificationsService.go(notifications, event, referenceCode)

        const refreshedEvent = await event.$query()

        expect(refreshedEvent).to.equal({
          createdAt: event.createdAt,
          entities: null,
          id: event.id,
          issuer: 'test.user@defra.gov.uk',
          licences: event.licences,
          metadata: { error: 1 },
          overallStatus: null,
          referenceCode,
          status: 'completed',
          overallStatus: 'error',
          statusCounts: { sent: 0, error: 1, pending: 0, returned: 0 },
          subtype: 'returnInvitation',
          type: 'notification',
          updatedAt: refreshedEvent.updatedAt
        })
      })
    })
  })
})

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
      status: 'pending',
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
      status: 'pending',
      templateId: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f'
    },
    pdf: {
      eventId,
      licences,
      messageRef: 'pdf.return_form',
      messageType: 'letter',
      pdf: Buffer.from('mock file'),
      personalisation: { name: 'Red 5' },
      returnLogIds: [generateUUID()],
      status: 'pending'
    }
  }
}
