'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/contact-type` page
 * @module ContactTypePresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/contact-type` page
 *
 * @param {SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const email = session?.email ?? null
  const name = session?.contactName ?? null
  const type = session?.contactType ?? null

  return {
    backLink: {
      href: `/system/notices/setup/${session.id}/select-recipients`,
      text: 'Back'
    },
    email,
    name,
    pageTitle: 'Select how to contact the recipient',
    pageTitleCaption: `Notice ${session.referenceCode}`,
    type
  }
}

module.exports = {
  go
}
