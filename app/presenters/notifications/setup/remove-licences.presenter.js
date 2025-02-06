'use strict'

/**
 * Formats data for the `/notifications/setup/remove-licences` page
 * @module RemoveLicencesPresenter
 */

/**
 * Formats data for the `/notifications/setup/remove-licences` page
 *
 * @param {string[]} licences - List of licences to remove from the recipients list
 *
 * @returns {object} - The data formatted for the view template
 */
function go(licences) {
  return {
    pageTitle: 'Enter the licence numbers to remove from the mailing list',
    hint: 'Separate the licences numbers with a comma or new line.',
    licences
  }
}

module.exports = {
  go
}
