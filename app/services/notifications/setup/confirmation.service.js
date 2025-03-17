'use strict'

/**
 * Orchestrates presenting the data for `/notifications/setup/{eventId}/confirmation` page
 * @module ConfirmationService
 */

const ConfirmationPresenter = require('../../../presenters/notifications/setup/confirmation.presenter.js')
const EventModel = require('../../../models/event.model.js')

/**
 * Orchestrates presenting the data for `/notifications/setup/{eventId}/confirmation` page
 *
 * @param {string} eventId - The UUID for the event
 *
 * @returns {Promise<object>} The view data for the licence page
 */
async function go(eventId) {
  const event = await _getEventId(eventId)

  const formattedData = ConfirmationPresenter.go(event)

  return {
    activeNavBar: 'manage',
    ...formattedData
  }
}

async function _getEventId(eventId) {
  return EventModel.query().findById(eventId)
}

module.exports = {
  go
}
