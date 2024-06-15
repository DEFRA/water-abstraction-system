'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const EventHelper = require('../../support/helpers/event.helper.js')
const ScheduledNotificationModel = require('../../support/helpers/scheduled-notification.helper.js')

// Thing under test
const FetchCommunicationsService =
  require('../../../app/services/licences/fetch-communications.service.js')

describe('Fetch Communications service', () => {
  const licenceRef = '01/01'

  let event
  let scheduledNotification

  beforeEach(async () => {
    await DatabaseSupport.clean()

    event = await EventHelper.add({
      createdAt: new Date('2024-06-01'),
      licences: JSON.stringify([licenceRef]),
      metadata: null,
      status: 'sent',
      subtype: 'renewal',
      type: 'notification'
    })

    scheduledNotification = await ScheduledNotificationModel.add({
      eventId: event.id,
      licences: JSON.stringify([licenceRef]),
      notifyStatus: 'delivered'
    })
  })

  describe('when the licence has communications', () => {
    it('returns the matching communication', async () => {
      const result = await FetchCommunicationsService.go(licenceRef, 1)

      expect(result.pagination).to.equal({
        total: 1
      })

      expect(result.communications).to.equal(
        [{
          event: {
            createdAt: new Date('2024-06-01'),
            issuer: 'test.user@defra.gov.uk',
            metadata: null,
            status: 'sent',
            subtype: 'renewal',
            type: 'notification'
          },
          id: scheduledNotification.id,
          messageRef: null,
          messageType: null
        }]
      )
    })
  })

  describe.skip('when the licence has no communications', () => {
    it('returns no communications', async () => {
      const result = await FetchCommunicationsService.go('01/02', 1)

      expect(result.pagination).to.equal({
        total: 0
      })

      expect(result.communications).to.be.empty()
    })
  })
})
