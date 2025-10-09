'use strict'

/**
 * Formats data for the `/search` page
 * @module SearchPresenter
 */

const { today } = require('../../lib/general.lib.js')

/**
 * Formats data for the `/search` page
 *
 * @param {string} query - The user-entered search query - falsey if no query has been entered
 * @param {string} page - The user-requested page, for paginated results
 * @param {Array<object>} licences - The list of licences matching the search criteria
 *
 * @returns {object} - The data formatted for the view template
 */
function go(query, page, licences) {
  // If there's no page, we're just displaying the blank search page
  if (!page) {
    return {
      pageTitle: 'Search',
      query: query ?? ''
    }
  }

  return {
    licences: licences && _mapLicences(licences),
    noResults: !licences || licences.length === 0,
    page,
    pageTitle: 'Search',
    query: query ?? '',
    showResults: true
  }
}

function _mapLicences(licences) {
  return licences.map((licence) => {
    const licenceEnd = licence.$ends()
    const { Forename, Initials, Name, Salutation } = licence.metadata
    const { id, licenceRef } = licence

    // Holder name is either a company name given by Name or made up of any parts of Salutation, Initials, Forename and
    // Name that are populated, where Name provides the surname for a person.
    // Licences that have ended don't seem to have this information populated, which makes their display a bit
    // unhelpful.
    const licenceHolderName = [Salutation, Initials || Forename, Name].filter(Boolean).join(' ')

    // Licences that have ended are just displayed with the reason and year they ended (don't know why)
    let licenceEndedText
    if (licenceEnd) {
      const { date, reason } = licenceEnd
      licenceEndedText = date && date <= today() ? `${reason} in ${date.getFullYear()}` : null
    }

    return {
      id,
      licenceEndedText,
      licenceHolderName,
      licenceRef
    }
  })
}

module.exports = {
  go
}
