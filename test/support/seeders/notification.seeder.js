'use strict'

/**
 * @module NotificationSeeder
 */

const EventHelper = require('../helpers/event.helper.js')
const NotificationHelper = require('../helpers/notification.helper.js')
const { today } = require('../../../app/lib/general.lib.js')

/**
 * Adds an event with notifications to the database
 */
async function seed() {
  const event = await EventHelper.add({
    type: 'notification',
    status: 'completed'
  })

  const notifications = {
    email: {
      pending: await NotificationHelper.add({
        eventId: event.id,
        messageRef: 'returns_invitation_primary_user_email',
        messageType: 'email',
        status: 'pending'
      })
    },
    letter: {
      pending: await NotificationHelper.add({
        eventId: event.id,
        messageRef: 'returns_invitation_licence_holder_letter',
        messageType: 'letter',
        status: 'pending'
      })
    },
    olderThanRetention: await olderThanRetention(event)
  }

  await errorNotification(event)

  return {
    event,
    notifications
  }
}

/**
 * The query restricts the notifications to those older than 7 days
 *
 * This should not be returned by the query
 * @private
 */
async function olderThanRetention(event) {
  const todaysDate = today()
  const eightDaysAgo = today()
  eightDaysAgo.setDate(todaysDate.getDate() - 8)

  return await NotificationHelper.add({
    eventId: event.id,
    status: 'sending',
    createdAt: eightDaysAgo
  })
}

/**
 * Adds an error notification to the database
 *
 * This should not be returned by the query
 * @private
 */
async function errorNotification(event) {
  await NotificationHelper.add({
    eventId: event.id,
    messageRef: 'returns_invitation_licence_holder_letter',
    messageType: 'letter',
    status: 'error'
  })
}

module.exports = { seed }
