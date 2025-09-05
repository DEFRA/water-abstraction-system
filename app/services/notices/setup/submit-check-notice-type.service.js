'use strict'

/**
 * Orchestrates the user confirming the notice type on the `/notices/setup/{sessionId}/check-notice-type` page
 *
 * @module SubmitCheckNoticeTypeService
 */

const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates the user confirming the notice type on the `/notices/setup/{sessionId}/check-notice-type` page
 *
 * Some notice setup journeys rely on using our 'shared' address setup journey. To support this, we have to add an
 * `addressJourney` property to the session data, configured to work with the journey embedding it.
 *
 * We add the object here, at the point the user confirms the notice type.
 *
 * @param {string} sessionId - The UUID of the current session
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  session.addressJourney = {
    activeNavBar: 'manage',
    address: {},
    backLink: _backLink(session),
    redirectUrl: `/system/notices/setup/${session.id}/add-recipient`
  }

  await session.$update()
}

/**
 * Determines the back link our generic address journey should use on its postcode page
 *
 * When a user leaves this journey and joins our generic address entry journey, they don't know that's what happened!
 * They may wish to go back using the 'Back' link on the first page of the address journey (the postcode page).
 *
 * So, we need to tell the address journey where to go back to, just as we tell it where to redirect when the user
 * has completed entering an address.
 *
 * Typically, you would know that at the start of the journey. But ad-hoc is the exception, because depending on the
 * notice type, the page that leads to the postcode page will be different.
 *
 * @param {SessionModel} session - The current session
 *
 * @returns {object} The back link to be used in the generic address journey's postcode page
 *
 * @private
 */
function _backLink(session) {
  if (session.noticeType === 'invitations') {
    return { href: `/system/notices/setup/${session.id}/contact-type`, text: 'Back' }
  }

  // TODO: This is temporarily the same as above as we are soon to merge the page and route we'll actually use.
  return { href: `/system/notices/setup/${session.id}/contact-type`, text: 'Back' }
}

module.exports = {
  go
}
