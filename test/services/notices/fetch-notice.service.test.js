'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')

// Thing under test
const FetchNoticeService = require('../../../app/services/notices/fetch-notice.service.js')

describe('Notices - Fetch Notice service', () => {
  let event
  let notificationEmail
  let notificationLetter

  describe('when a notice exists', () => {
    beforeEach(async () => {
      event = await EventHelper.add({
        issuer: 'admin-internal@wrls.gov.uk',
        licences: JSON.stringify(['01/123', '01/124']),
        metadata: {
          name: 'Water abstraction alert',
          error: 1,
          options: {
            sendingAlertType: 'warning',
            monitoringStationId: '7195f45e-6597-4771-85dc-e223cb55bc63'
          },
          recipients: 2
        },
        referenceCode: 'WAA-WULXRU',
        status: 'completed',
        subtype: 'waterAbstractionAlerts',
        type: 'notification'
      })

      notificationEmail = await NotificationHelper.add({
        eventId: event.id,
        licences: JSON.stringify(['01/124']),
        messageRef: 'water_abstraction_alert_reduce_or_stop_warning_email',
        messageType: 'email',
        notifyId: '0bc87785-e64f-4b99-b15c-ee825235f9bf',
        notifyStatus: 'permanent-failure',
        personalisation: {
          alertType: 'warning',
          condition_text: '',
          flow_or_level: 'flow',
          issuer_email_address: 'admin-internal@wrls.gov.uk',
          licence_ref: '01/124',
          licenceMonitoringStationId: '399d4483-a198-4fe5-b229-45e2fc2a57ec',
          monitoring_station_name: 'FRENCHAY',
          source: '',
          threshold_unit: 'm3/s',
          threshold_value: 100
        },
        recipient: 'shaw.carol@atari.com',
        status: 'error'
      })

      notificationLetter = await NotificationHelper.add({
        eventId: event.id,
        licences: JSON.stringify(['01/123']),
        messageRef: 'water_abstraction_alert_stop_warning',
        messageType: 'letter',
        notifyId: '67b2849b-02bc-42fd-a623-86f6c2817e2d',
        notifyStatus: 'received',
        personalisation: {
          address_line_1: 'Clean Water Limited',
          address_line_2: 'c/o Bob Bobbles',
          address_line_3: 'Water Lane',
          address_line_4: 'Swampy Heath',
          address_line_5: 'CAMBRIDGESHIRE',
          address_line_6: 'CB23 1ZZ',
          alertType: 'warning',
          condition_text: 'Effect of restriction: 9.2 (ii) No abstraction shall take place when we say so',
          flow_or_level: 'flow',
          issuer_email_address: 'admin-internal@wrls.gov.uk',
          licence_ref: '01/123',
          licenceMonitoringStationId: 'b7cb48d1-7e23-49b8-9cee-686d302fdc48',
          name: 'Clean Water Limited',
          monitoring_station_name: 'FRENCHAY',
          source: '',
          threshold_unit: 'm3/s',
          threshold_value: 100
        },
        recipient: null,
        status: 'sent'
      })
    })

    it('fetches the matching notice and associated notifications', async () => {
      const result = await FetchNoticeService.go(event.id)

      expect(result.notice).to.equal({
        createdAt: event.createdAt,
        id: event.id,
        referenceCode: 'WAA-WULXRU',
        issuer: 'admin-internal@wrls.gov.uk',
        status: 'completed',
        subtype: 'waterAbstractionAlerts'
      })

      expect(result.notifications).to.equal([
        {
          id: notificationLetter.id,
          recipientName: 'Clean Water Limited',
          licences: ['01/123'],
          messageType: 'letter',
          notifyStatus: 'received',
          personalisation: notificationLetter.personalisation,
          status: 'sent'
        },
        {
          id: notificationEmail.id,
          recipientName: 'shaw.carol@atari.com',
          licences: ['01/124'],
          messageType: 'email',
          notifyStatus: 'permanent-failure',
          personalisation: notificationEmail.personalisation,
          status: 'error'
        }
      ])
    })
  })

  describe('when a notice does not exist', () => {
    it('returns an empty result', async () => {
      const result = await FetchNoticeService.go('03bded61-9e68-4c57-a2fc-811c580efb44')

      expect(result).to.equal({
        notice: undefined,
        notifications: []
      })
    })
  })
})
