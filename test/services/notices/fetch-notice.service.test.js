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
        metadata: {
          name: 'Water abstraction alert',
          options: {
            sendingAlertType: 'stop'
          },
          recipients: 1
        }
      })
      testScheduledNotification = await ScheduledNotificationHelper.add({ eventId: testEvent.id })
    })

    it('fetches the matching notice', async () => {
      const result = await FetchNoticeService.go(testScheduledNotification.id)

      expect(result.results).to.contain(
        ScheduledNotificationModel.fromJson({
          messageType: testScheduledNotification.messageType,
          messageRef: testScheduledNotification.messageRef,
          personalisation: testScheduledNotification.personalisation,
          status: testScheduledNotification.status,
          licences: testScheduledNotification.licences,
          event: EventModel.fromJson({
            referenceCode: 'RREM-RD2KF4'
          })
        })
      )
    })
  })

  describe('when a notice does not exists', () => {
    it('returns an empty array', async () => {
      const result = await FetchNoticeService.go('03bded61-9e68-4c57-a2fc-811c580efb44')

      expect(result.results).to.equal(undefined)
    })
  })
})
