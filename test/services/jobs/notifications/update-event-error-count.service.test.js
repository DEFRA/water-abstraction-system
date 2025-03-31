'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventHelper = require('../../../support/helpers/event.helper.js')
const EventModel = require('../../../../app/models/event.model.js')
const ScheduledNotificationHelper = require('../../../support/helpers/scheduled-notification.helper.js')

// Thing under test
const UpdateEventErrorCountService = require('../../../../app/services/jobs/notifications/update-event-error-count.service.js')

describe('Job - Notifications - Update event service', () => {
  let event

  beforeEach(async () => {
    event = await EventHelper.add({
      type: 'notification',
      status: 'completed',
      metadata: {}
    })

    await ScheduledNotificationHelper.add({
      eventId: event.id,
      status: 'sending'
    })

    // This event contains errors but is not part of the events id's in the array to update the errors
    const additionalEvent = await EventHelper.add({
      type: 'notification',
      status: 'completed',
      metadata: {}
    })

    await ScheduledNotificationHelper.add({
      eventId: additionalEvent.id,
      status: 'error'
    })
  })

  describe('when there are errors', () => {
    beforeEach(async () => {
      await ScheduledNotificationHelper.add({
        eventId: event.id,
        status: 'error'
      })
    })

    describe('and the "scheduledNotifications" have a single error', () => {
      it('updates the error count"', async () => {
        await UpdateEventErrorCountService.go([event.id])

        const result = await EventModel.query().findById(event.id)

        expect(result.metadata.error).to.equal(1)
      })
    })

    describe('and the "scheduledNotification" have multiple errors', () => {
      beforeEach(async () => {
        await ScheduledNotificationHelper.add({
          eventId: event.id,
          status: 'error'
        })
      })

      it('updates the error count"', async () => {
        await UpdateEventErrorCountService.go([event.id])

        const result = await EventModel.query().findById(event.id)

        expect(result.metadata.error).to.equal(2)
      })
    })

    describe('and the "scheduledNotification" have existing errors', () => {
      beforeEach(async () => {
        event = await EventHelper.add({
          type: 'notification',
          status: 'completed',
          metadata: { errors: 3 }
        })

        await ScheduledNotificationHelper.add({
          eventId: event.id,
          status: 'error'
        })
      })

      it('should override the error count"', async () => {
        await UpdateEventErrorCountService.go([event.id])

        const result = await EventModel.query().findById(event.id)

        expect(result.metadata.error).to.equal(1)
      })
    })
  })

  describe('when there are no errors', () => {
    describe('and the "scheduledNotification" have no errors', () => {
      it('should not update the error count"', async () => {
        await UpdateEventErrorCountService.go([event.id])

        const result = await EventModel.query().findById(event.id)

        expect(result.metadata.error).to.be.undefined()
      })
    })
  })
})
