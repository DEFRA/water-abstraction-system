'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const EventModel = require('../../../app/models/event.model.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const NotificationModel = require('../../../app/models/notification.model.js')

// Thing under test
const FetchNoticeService = require('../../../app/services/notices/fetch-notice.service.js')

describe('Notices - Fetch Notice service', () => {
  let testEvent
  let testNotification

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
      testNotification = await NotificationHelper.add({ eventId: testEvent.id })
    })

    it('fetches the matching notice', async () => {
      const result = await FetchNoticeService.go(testNotification.id)

      expect(result.results).to.contain(
        NotificationModel.fromJson({
          messageType: testNotification.messageType,
          messageRef: testNotification.messageRef,
          personalisation: testNotification.personalisation,
          status: testNotification.status,
          licences: testNotification.licences,
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
