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
 * @param {string} numberOfPages - The total number of pages available for the search results
 * @param {object[]} licences - The list of licences matching the search criteria
 * @param {object[]} returnLogs - The list of return logs matching the search criteria
 * @param {object[]} monitoringStations - The list of monitoring stations matching the search criteria
 *
 * @returns {object} - The data formatted for the view template
 */
function go(query, page, numberOfPages, licences, returnLogs, monitoringStations) {
  // If there's no page number provided, we're just displaying the blank search page, potentially with any search
  // query that the user may have entered but was not searchable, e.g. whitespace or other unsearchable text
  if (!page) {
    return {
      pageTitle: 'Search',
      query,
      showResults: false
    }
  }

  return {
    licences: _licences(licences),
    monitoringStations: _monitoringStations(monitoringStations),
    noResults: licences.length === 0 && returnLogs.length === 0 && monitoringStations.length === 0,
    page,
    pageTitle: _pageTitle(numberOfPages, page),
    query,
    returnLogs: _returnLogs(returnLogs),
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
    const { Forename: firstName, Initials: initials, Name: lastName, Salutation: salutation } = licence.metadata
    const { id, licenceRef } = licence

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
    const { id, licenceRef, regionDisplayName, returnReference } = returnLog

    const statusText = formatReturnLogStatus(returnLog)

    return {
      endDate: formatLongDate(returnLog.endDate),
      id,
      licenceRef,
      returnReference,
      regionDisplayName,
      statusText
    }
  })
}

module.exports = {
  go
}
