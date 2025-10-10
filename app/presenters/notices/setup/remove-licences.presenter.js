'use strict'

/**
 * Formats data for the `/notices/setup/remove-licences` page
 * @module RemoveLicencesPresenter
 */

/**
 * Formats data for the `/notices/setup/remove-licences` page
 *
 * @param {string[]} removeLicences - List of licences to remove from the recipients list
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(removeLicences, session) {
  const { referenceCode, id: sessionId } = session

  return {
    backLink: { text: 'Back', href: `/system/notices/setup/${sessionId}/check` },
    hint: 'Separate the licences numbers with a comma or new line.',
    pageTitle: 'Enter the licence numbers to remove from the mailing list',
    pageTitleCaption: `Notice ${referenceCode}`,
    removeLicences
  }
}

module.exports = {
  go
}
