'use strict'

/**
 * Formats data for the `/notices/setup/remove-licences` page
 * @module RemoveLicencesPresenter
 */

/**
 * Formats data for the `/notices/setup/remove-licences` page
 *
 * @param {string[]} removeLicences - List of licences to remove from the recipients list
 * @param {string} referenceCode - the unique generated reference code
 *
 * @returns {object} - The data formatted for the view template
 */
function go(removeLicences, referenceCode) {
  return {
    caption: `Notice ${referenceCode}`,
    hint: 'Separate the licences numbers with a comma or new line.',
    pageTitle: 'Enter the licence numbers to remove from the mailing list',
    removeLicences
  }
}

module.exports = {
  go
}
