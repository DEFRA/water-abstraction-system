'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { notifyTemplates } = require('../../../../app/lib/notify-templates.lib.js')

// Things we need to stub
const DetermineReturnFormsService = require('../../../../app/services/notices/setup/determine-return-forms.service.js')

// Thing under test
const DetermineNotificationsService = require('../../../../app/services/notices/setup/determine-notifications.service.js')

describe('Notices - Setup - Determine Notifications service', () => {
  let clock
  let event
  let recipients
  let recipientsFixture
  let session
  let testDate

  beforeEach(async () => {
    testDate = new Date('2024-12-01')

    clock = Sinon.useFakeTimers(testDate)
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
  })

  describe('when sending return invitations or reminders', () => {
    beforeEach(async () => {
      recipientsFixture = RecipientsFixture.recipients()
      recipients = [recipientsFixture.primaryUser]

      event = {
        id: generateUUID(),
        licences: [recipientsFixture.primaryUser.licence_refs]
      }

      session = {
        determinedReturnsPeriod: {
          name: 'allYear',
          dueDate: '2025-04-28',
          endDate: '2023-03-31',
          summer: 'false',
          startDate: '2022-04-01'
        },
        journey: 'standard',
        noticeType: 'invitations'
      }
    })

    it('should return standard notifications', async () => {
      const notifications = await DetermineNotificationsService.go(session, recipients, event.id)

      expect(notifications).to.equal([
        {
          createdAt: testDate.toISOString(),
          eventId: event.id,
          licences: recipients[0].licence_refs.split(','),
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
        }
      ])
    })
  })

  describe('when sending abstraction alerts', () => {
    beforeEach(async () => {
      recipientsFixture = RecipientsFixture.alertsRecipients()
      recipients = [recipientsFixture.primaryUser]

      event = {
        id: generateUUID(),
        licences: [recipientsFixture.primaryUser.licence_refs]
      }

      const licenceMonitoringStations = [
        {
          id: '4a87cf86-76ff-4059-9b74-924ab19c1367',
          notes: null,
          status: null,
          licence: {
            id: 'f9a0fdad-9608-4559-a8f1-d680fec25c9a',
            licenceRef: recipientsFixture.primaryUser.licence_refs
          },
          measureType: 'flow',
          thresholdUnit: 'Ml/d',
          thresholdGroup: 'flow-500-Ml/d',
          thresholdValue: 500,
          restrictionType: 'stop',
          statusUpdatedAt: null,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4
        }
      ]

      session = {
        address: {
          redirectUrl: '/system/notices/setup/22dd7d17-41f1-4b56-bbdb-b7e35364bf24/add-recipient'
        },
        alertEmailAddress: 'admin-internal@wrls.gov.uk',
        alertEmailAddressType: 'username',
        alertThresholds: ['flow-1000-Ml/d', 'flow-750-Ml/d', 'flow-500-Ml/d'],
        alertType: 'warning',
        id: '22dd7d17-41f1-4b56-bbdb-b7e35364bf24',
        journey: 'alerts',
        licenceRefs: event.licences,
        licenceMonitoringStations,
        monitoringStationId: '7195f45e-6597-4771-85dc-e223cb55bc63',
        monitoringStationName: 'FRENCHAY',
        monitoringStationRiverName: '',
        name: 'Water abstraction alert',
        noticeType: 'abstractionAlerts',
        notificationType: 'Abstraction alert',
        relevantLicenceMonitoringStations: [...licenceMonitoringStations],
        removedThresholds: [],
        selectedRecipients: [],
        subType: 'waterAbstractionAlerts'
      }
    })

    it('should return abstraction alerts notifications', async () => {
      const notifications = await DetermineNotificationsService.go(session, recipients, event.id)

      expect(notifications).to.equal([
        {
          createdAt: testDate.toISOString(),
          eventId: event.id,
          licenceMonitoringStationId: session.licenceMonitoringStations[0].id,
          licences: recipientsFixture.primaryUser.licence_refs.split(','),
          messageRef: 'water_abstraction_alert_stop_warning_email',
          messageType: 'email',
          personalisation: {
            alertType: 'stop',
            condition_text: '',
            flow_or_level: 'flow',
            issuer_email_address: 'admin-internal@wrls.gov.uk',
            label: 'FRENCHAY',
            licenceGaugingStationId: '4a87cf86-76ff-4059-9b74-924ab19c1367',
            licenceId: session.licenceMonitoringStations[0].licence.id,
            licenceRef: recipientsFixture.primaryUser.licence_refs,
            monitoring_station_name: 'FRENCHAY',
            sending_alert_type: 'warning',
            source: '',
            thresholdUnit: 'Ml/d',
            thresholdValue: 500
          },
          recipient: 'primary.user@important.com',
          status: 'pending',
          templateId: notifyTemplates.alerts.email.stopWarning
        }
      ])
    })
  })

  describe('when sending return forms', () => {
    let buffer
    let returnId

    beforeEach(async () => {
      returnId = generateUUID()

      recipientsFixture = RecipientsFixture.recipients()
      recipients = [recipientsFixture.licenceHolder]

      event = {
        id: generateUUID(),
        licences: [recipientsFixture.licenceHolder.licence_refs]
      }

      session = {
        noticeType: 'returnForms'
      }

      buffer = new TextEncoder().encode('mock file').buffer

      const notification = {
        content: buffer,
        eventId: event.id,
        licences: [recipientsFixture.licenceHolder.licence_refs],
        messageRef: 'pdf.return_form',
        messageType: 'letter',
        returnLogIds: [returnId]
      }

      Sinon.stub(DetermineReturnFormsService, 'go').resolves([
        {
          ...notification,
          personalisation: { name: 'Red 5' }
        }
      ])
    })

    it('should return "return forms" notifications', async () => {
      const notifications = await DetermineNotificationsService.go(session, recipients, event.id)

      expect(notifications).to.equal([
        {
          content: buffer,
          eventId: event.id,
          licences: [recipientsFixture.licenceHolder.licence_refs],
          messageRef: 'pdf.return_form',
          messageType: 'letter',
          personalisation: {
            name: 'Red 5'
          },
          returnLogIds: [returnId]
        }
      ])
    })
  })
})
