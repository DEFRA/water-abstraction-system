'use strict'

/**
 * Formats data for the `/search` page
 * @module SearchPresenter
 */

const { formatDateMonthYear } = require('../base.presenter.js')
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
    page,
    pageTitle: 'Search',
    query: query ?? ''
  }
}

function _mapLicences(licences) {
  return licences.map((licence) => {
    const { Name, Forename, Initials, Salutation } = licence.metadata
    const holderNameParts = [Salutation, Initials || Forename, Name].filter(Boolean)

    const licenceEnded = licence.$ends()
    const isActive = _licenceIsActive(licence.startDate, licenceEnded?.date)
    let licenceEndedText = null
    if (licenceEnded && !isActive) {
      licenceEndedText = `${licenceEnded.reason} in ${licenceEnded.date.getFullYear()}`
    }

    const { endDate } = licence
    const endDateText = endDate ? formatDateMonthYear(endDate) : null

    return {
      endDateText,
      isActive,
      licenceEndedText,
      licenceHolderName: holderNameParts.join(' '),
      licenceId: licence.id,
      ...licence
    }
  })
}

function _licenceIsActive(start, end) {
  const todayInMilliseconds = today().valueOf()

  if (start > todayInMilliseconds) {
    return false
  }

  if (!end) {
    return true
  }

  return todayInMilliseconds <= end
}

module.exports = {
  go
}
