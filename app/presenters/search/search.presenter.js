'use strict'

/**
 * Formats data for the `/search` page
 * @module SearchPresenter
 */

const ContactModel = require('../../models/contact.model.js')
const { formatLongDate, formatReturnLogStatus } = require('../base.presenter.js')
const { today } = require('../../lib/general.lib.js')

/**
 * Formats data for the `/search` page
 *
 * @param {string} query - The user-entered search query, if any
 * @param {string} page - The requested page, when displaying search results
 * @param {string} resultType - The type of search results being displayed
 * @param {string} numberOfPages - The total number of pages available for the search results
 * @param {object} allSearchMatches - All the search matches found
 *
 * @returns {object} - The data formatted for the view template
 */
function go(query, resultType, page, numberOfPages, allSearchMatches) {
  // If there's no page number provided, we're just displaying the blank search page, potentially with any search
  // query that the user may have entered but was not searchable, e.g. whitespace or other unsearchable text
  if (!page) {
    return {
      pageTitle: 'Search',
      query,
      resultType,
      showResults: false
    }
  }

  const { exactSearchResults, similarSearchResults } = allSearchMatches
  return {
    exactMatches: {
      licences: _licences(exactSearchResults.licences.results),
      monitoringStations: _monitoringStations(exactSearchResults.monitoringStations.results),
      returnLogs: _returnLogs(exactSearchResults.returnLogs.results)
    },
    noPartialResults: similarSearchResults.amountFound === 0,
    noResults: exactSearchResults.amountFound === 0 && similarSearchResults.amountFound === 0,
    page,
    pageTitle: _pageTitle(numberOfPages, page),
    partialMatches: {
      licences: _licences(similarSearchResults.licences.results),
      monitoringStations: _monitoringStations(similarSearchResults.monitoringStations.results),
      returnLogs: _returnLogs(similarSearchResults.returnLogs.results)
    },
    query,
    resultType,
    showExactResults: exactSearchResults.amountFound !== 0,
    showResults: true
  }
}

function _licenceEndDetails(licenceEnd) {
  let licenceEndDate = null
  let licenceEndedText = null

  if (licenceEnd) {
    const { date, reason } = licenceEnd

    licenceEndDate = formatLongDate(date)

    if (date <= today()) {
      licenceEndedText = reason
    }
  }

  return { licenceEndDate, licenceEndedText }
}

function _licences(licences) {
  if (licences.length === 0) {
    return null
  }

  return licences.map((licence) => {
    const licenceEnd = licence.$ends()
    const { id, licenceRef } = licence

    const holderContact =
      licence.metadata?.contacts?.find((contact) => {
        return contact.role === 'Licence holder'
      }) ?? {}
    const { forename: firstName, initials, name: lastName, salutation } = holderContact

    // Holder name is either a company name given by Name or made up of any parts of Salutation, Initials, Forename and
    // Name that are populated, where Name provides the surname for a person.
    // Licences that have ended don't seem to have this information populated, which makes their display a bit
    // unhelpful.
    const holderContactModel = ContactModel.fromJson({ firstName, initials, lastName, salutation })
    const licenceHolderName = holderContactModel.$name()

    // Licences that have ended are displayed with a tag showing the reason
    const { licenceEndDate, licenceEndedText } = _licenceEndDetails(licenceEnd)

    return { id, licenceEndDate, licenceEndedText, licenceHolderName, licenceRef }
  })
}

function _monitoringStations(monitoringStations) {
  if (monitoringStations.length === 0) {
    return null
  }

  return monitoringStations
}

function _pageTitle(numberOfPages, selectedPageNumber) {
  if (numberOfPages < 2) {
    return 'Search results'
  }

  return `Search results (page ${selectedPageNumber} of ${numberOfPages})`
}

function _returnLogs(returnLogs) {
  if (returnLogs.length === 0) {
    return null
  }

  return returnLogs.map((returnLog) => {
    const { dueDates, endDates, id: licenceId, ids, licenceRef, returnReference, statuses } = returnLog

    const returnLogDetail = ids
      .map((id, index) => {
        const dueDate = dueDates[index]
        const endDate = endDates[index]
        const status = statuses[index]

        return { dueDate, endDate, id, status }
      })
      .sort((a, b) => {
        return b.endDate - a.endDate
      })[0]

    const statusText = formatReturnLogStatus(returnLogDetail)
    const { id } = returnLogDetail

    return {
      endDate: formatLongDate(returnLogDetail.endDate),
      id,
      licenceId,
      licenceRef,
      returnReference,
      statusText
    }
  })
}

module.exports = {
  go
}
