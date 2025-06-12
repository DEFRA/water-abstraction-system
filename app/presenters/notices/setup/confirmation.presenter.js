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

  return {
    forwardLink: `/notifications/report/${eventId}`,
    pageTitle: _pageTitle(subtype),
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
function _pageTitle(subType) {
  if (subType === 'waterAbstractionAlerts') {
    return 'Water abstraction alerts sent'
  }

  const subTypes = {
    returnInvitation: 'invitations',
    returnReminder: 'reminders',
    adHocReminder: 'ad-hoc'
  }

  return `Returns ${subTypes[subType]} sent`
}

module.exports = {
  go
}
