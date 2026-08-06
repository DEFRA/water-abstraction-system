/**
 * Orchestrates presenting the data for `/notices/setup/{eventId}/confirmation` page
 * @module ViewConfirmationService
 */

import EventModel from 'water-abstraction-engine/models/event.model.js'

import ConfirmationPresenter from '../../../presenters/notices/setup/confirmation.presenter.js'

/**
 * Orchestrates presenting the data for `/notices/setup/{eventId}/confirmation` page
 *
 * @param {string} eventId - The UUID for the event
 *
 * @returns {Promise<object>} The view data for the confirmation page
 */
export default async function viewConfirmationService(eventId) {
  const event = await EventModel.query().findById(eventId)

  const formattedData = ConfirmationPresenter(event)

  return {
    activeNavBar: 'notices',
    ...formattedData
  }
}
