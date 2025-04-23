'use strict'

/**
 * Formats data for the `/notices/setup/{eventId}/confirmation` page
 * @module ConfirmationPresenter
 */

/**
 * Formats data for the `/notices/setup/{eventId}/confirmation` page
 *
 * @param {module:EventModel} event
 *
 * @returns {object} - The data formatted for the view template
 */
function go(event) {
  const { referenceCode, subtype, id: eventId } = event

  const type = _type(subtype)

  return {
    forwardLink: `/notifications/report/${eventId}`,
    pageTitle: `Returns ${type} sent`,
    referenceCode
  }
}

/**
 * An Event 'subType' is a legacy code concept we have needed to adapt to conform to existing patterns.
 *
 * We convert our 'journey' keys into 'supTypes' when we create an event. As we have no access to the session for the
 * confirmation page we need to remap these 'supTypes' into 'journey' keys to display to the user to keep conformity.
 *
 * @private
 */
function _type(subType) {
  const subTypes = {
    returnInvitation: 'invitations',
    returnReminder: 'reminders',
    adHocReminder: 'ad-hoc'
  }

  return subTypes[subType]
}

module.exports = {
  go
}
