/**
 * Formats data for the `/notices/setup/{eventId}/confirmation` page
 * @module ConfirmationPresenter
 */

import { NoticeType, NoticeTypes } from '../../../lib/static-lookups.lib.js'

/**
 * Formats data for the `/notices/setup/{eventId}/confirmation` page
 *
 * @param {module:EventModel} event
 *
 * @returns {object} - The data formatted for the view template
 */
function go(event) {
  const { referenceCode, subtype, id: eventId, metadata } = event

  return {
    forwardLink: `/system/notices/${eventId}`,
    monitoringStationLink: _monitoringStationLink(metadata),
    pageTitle: _pageTitle(subtype),
    referenceCode
  }
}

function _monitoringStationLink(metadata) {
  return metadata.options?.monitoringStationId
    ? `/system/monitoring-stations/${metadata.options?.monitoringStationId}`
    : null
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
  if (subType === NoticeTypes[NoticeType.ABSTRACTION_ALERTS].subType) {
    return 'Water abstraction alerts sent'
  }

  if (subType === NoticeTypes[NoticeType.PAPER_RETURN].subType) {
    return 'Paper returns sent'
  }

  if (subType === NoticeTypes[NoticeType.RENEWAL_INVITATIONS].subType) {
    return 'Renewal invitations sent'
  }

  const subTypes = {
    [NoticeTypes[NoticeType.INVITATIONS].subType]: 'invitations',
    [NoticeTypes[NoticeType.REMINDERS].subType]: 'reminders'
  }

  return `Returns ${subTypes[subType]} sent`
}

export { go }
export default {
  go
}
