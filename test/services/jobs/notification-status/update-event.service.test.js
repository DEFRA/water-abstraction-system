'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const NotificationHelper = require('../../../support/helpers/notification.helper.js')

// Thing under test
const UpdateEventService = require('../../../../app/services/jobs/notification-status/update-event.service.js')

describe('Job - Notification Status - Update Event service', () => {
  let event

  beforeEach(async () => {
    event = await EventHelper.add({
      type: 'notification',
      status: 'completed',
      metadata: {},
      updatedAt: null
    })
  })

  describe('when there are only "sent" notifications', () => {
    beforeEach(async () => {
      await NotificationHelper.add({
        eventId: event.id,
        status: 'sent'
      })

      await NotificationHelper.add({
        eventId: event.id,
        status: 'sent'
      })
    })

    it('correctly updates the event', async () => {
      await UpdateEventService.go([event.id])

      const refreshEvent = await event.$query()

      expect(refreshEvent.metadata.error).to.equal(0)
      expect(refreshEvent.overallStatus).to.equal('sent')
      expect(refreshEvent.statusCounts).to.equal({ error: 0, pending: 0, returned: 0, sent: 2 })
      expect(refreshEvent.updatedAt).to.be.a.date()
    })

    describe('and a notification has a status of "pending"', () => {
      beforeEach(async () => {
        await NotificationHelper.add({
          eventId: event.id,
          status: 'pending'
        })
      })

      it('correctly updates the event', async () => {
        await UpdateEventService.go([event.id])

        const refreshEvent = await event.$query()

        expect(refreshEvent.metadata.error).to.equal(0)
        expect(refreshEvent.overallStatus).to.equal('pending')
        expect(refreshEvent.statusCounts).to.equal({ error: 0, pending: 1, returned: 0, sent: 2 })
      })

      describe('and a notification has a status of "error"', () => {
        beforeEach(async () => {
          await NotificationHelper.add({
            eventId: event.id,
            status: 'error'
          })
        })

        it('correctly updates the event', async () => {
          await UpdateEventService.go([event.id])

          const refreshEvent = await event.$query()

          expect(refreshEvent.metadata.error).to.equal(1)
          expect(refreshEvent.overallStatus).to.equal('error')
          expect(refreshEvent.statusCounts).to.equal({ error: 1, pending: 1, returned: 0, sent: 2 })
        })

        describe('and a notification has a status of "returned"', () => {
          beforeEach(async () => {
            await NotificationHelper.add({
              eventId: event.id,
              status: 'returned'
            })
          })

          it('correctly updates the event', async () => {
            await UpdateEventService.go([event.id])

            const refreshEvent = await event.$query()

            expect(refreshEvent.metadata.error).to.equal(1)
            expect(refreshEvent.overallStatus).to.equal('returned')
            expect(refreshEvent.statusCounts).to.equal({ error: 1, pending: 1, returned: 1, sent: 2 })
          })
        })
      })
    })

    describe('and the "Event" has existing errors in the metadata', () => {
      beforeEach(async () => {
        event = await EventHelper.add({
          type: 'notification',
          status: 'completed',
          metadata: { error: 3, name: 'Returns: reminder' }
        })

        await NotificationHelper.add({
          eventId: event.id,
          status: 'error'
        })
      })

      it('should override the error count and leave the rest of the metadata unaltered', async () => {
        await UpdateEventService.go([event.id])

        const refreshEvent = await event.$query()

        expect(refreshEvent.metadata).to.equal({ error: 1, name: 'Returns: reminder' })
      })
    })
  })

  describe('when an event is not in the array', () => {
    let additionalEvent

    beforeEach(async () => {
      // This event contains errors but is not part of the events id's in the array to update the errors
      additionalEvent = await EventHelper.add({
        type: 'notification',
        status: 'completed',
        metadata: {}
      })

      await NotificationHelper.add({
        eventId: additionalEvent.id,
        status: 'error'
      })
    })
    it('should not change other events', async () => {
      await UpdateEventService.go([event.id])

      const refreshEvent = await additionalEvent.$query()

      expect(refreshEvent).to.equal(additionalEvent)
    })
  })
})
