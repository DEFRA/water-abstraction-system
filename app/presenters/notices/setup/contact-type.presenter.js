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
  const contactEmail = session?.contactEmail ?? null
  const contactName = session?.contactName ?? null
  const contactType = session?.contactType ?? null

  return {
    backLink: {
      href: `/system/notices/setup/${session.id}/select-recipients`,
      text: 'Back'
    },
    contactEmail,
    contactName,
    contactType,
    pageTitle: 'Select how to contact the recipient',
    pageTitleCaption: `Notice ${session.referenceCode}`
  }
}

module.exports = {
  go
}
