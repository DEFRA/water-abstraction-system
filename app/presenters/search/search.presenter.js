'use strict'

/**
 * Formats data for the `/search` page
 * @module SearchPresenter
 */

const ContactModel = require('../../models/contact.model.js')
const { formatLongDate } = require('../base.presenter.js')
const { today } = require('../../lib/general.lib.js')

/**
 * Formats data for the `/search` page
 *
 * @param {string} query - The user-entered search query - falsey if no query has been entered
 * @param {string} page - The user-requested page, for paginated results
 * @param {string} numberOfPages - The total number of pages available for the search results
 * @param {Array<object>} licences - The list of licences matching the search criteria
 *
 * @returns {object} - The data formatted for the view template
 */
function go(query, page, numberOfPages, licences) {
  // If there's no page number provided, we're just displaying the blank search page, potentially with any search
  // query that the user may have entered but was not searchable, e.g. whitespace or other unsearchable text
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
    pageTitle: _pageTitle(numberOfPages, page),
    query,
    showResults: true
  }
}

function _mapLicences(licences) {
  return licences.map((licence) => {
    const licenceEnd = licence.$ends()
    const { Forename: firstName, Initials: initials, Name: lastName, Salutation: salutation } = licence.metadata
    const { id, licenceRef } = licence

    // Holder name is either a company name given by Name or made up of any parts of Salutation, Initials, Forename and
    // Name that are populated, where Name provides the surname for a person.
    // Licences that have ended don't seem to have this information populated, which makes their display a bit
    // unhelpful.
    const holderContactModel = ContactModel.fromJson({ firstName, initials, lastName, salutation })
    const licenceHolderName = holderContactModel.$name()

    // Licences that have ended are just displayed with the reason and year they ended (don't know why)
    let licenceEndedText
    let licenceEndDate
    if (licenceEnd) {
      const { date, reason } = licenceEnd
      licenceEndedText = date <= today() ? `${reason} in ${date.getFullYear()}` : null
      licenceEndDate = formatLongDate(date)
    }

    return { id, licenceEndDate, licenceEndedText, licenceHolderName, licenceRef }
  })
}

function _pageTitle(numberOfPages, selectedPageNumber) {
  if (numberOfPages < 2) {
    return 'Search results'
  }

  return `Search results (page ${selectedPageNumber} of ${numberOfPages})`
}

module.exports = {
  go
}
