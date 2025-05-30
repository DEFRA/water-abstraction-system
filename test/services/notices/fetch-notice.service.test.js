'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const EventModel = require('../../../app/models/event.model.js')
const ScheduledNotificationHelper = require('../../support/helpers/scheduled-notification.helper.js')
const ScheduledNotificationModel = require('../../../app/models/scheduled-notification.model.js')

// Thing under test
const FetchNoticeService = require('../../../app/services/notices/fetch-notice.service.js')

describe('Notices - Fetch Notice service', () => {
  let testEvent
  let testScheduledNotification

  describe('when a notice exists', () => {
    beforeEach(async () => {
      testEvent = await EventHelper.add({
        referenceCode: 'RREM-RD2KF4',
        type: 'notification',
        status: 'sent',
        subtype: 'returnReminder',
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'stop'
          },
          recipients: 1
        }
      })
      testScheduledNotification = await ScheduledNotificationHelper.add({
        messageType: 'letter',
        messageRef: 'returns_invitation_licence_holder_letter',
        personalisation: {
          postcode: 'SW1 2AN',
          address_line_1: 'Water company',
          address_line_2: 'Company street',
          address_line_3: 'Company town',
          address_line_4: 'Company region'
        },
        status: 'completed',
        licences: JSON.stringify("['03/TST/23']"),
        eventId: testEvent.id
      })
    })

    it('fetches the matching notice', async () => {
      const result = await FetchNoticeService.go(testEvent.id)

      expect(result.results).to.contain(
        ScheduledNotificationModel.fromJson({
          messageType: testScheduledNotification.messageType,
          messageRef: testScheduledNotification.messageRef,
          personalisation: testScheduledNotification.personalisation,
          status: testScheduledNotification.status,
          licences: "['03/TST/23']",
          recipient: null,
          event: EventModel.fromJson({
            id: testEvent.id,
            referenceCode: testEvent.referenceCode,
            issuer: testEvent.issuer,
            createdAt: testEvent.createdAt,
            status: 'sent',
            subtype: 'returnReminder'
          })
        })
      )
    })
  })

  describe('when a notice does not exist', () => {
    it('returns an empty array', async () => {
      const result = await FetchNoticeService.go('03bded61-9e68-4c57-a2fc-811c580efb44')

      expect(result.results).to.equal([])
    })
  })
})
