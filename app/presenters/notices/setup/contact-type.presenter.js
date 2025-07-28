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
  const { contactType, id } = session

  const email = contactType?.email ?? null
  const name = contactType?.name ?? null
  const type = contactType?.type ?? null

  return {
    backLink: `/system/notices/setup/${id}/select-recipients`,
    email,
    name,
    pageTitle: 'Select how to contact the recipient',
    type
  }
}

module.exports = {
  go
}
