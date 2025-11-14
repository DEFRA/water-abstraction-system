'use strict'

/**
 * Formats data for the `/search` page
 * @module SearchPresenter
 */

const ContactModel = require('../../models/contact.model.js')
const { formatLongDate, formatReturnLogStatus } = require('../base.presenter.js')
const { today } = require('../../lib/general.lib.js')

const resultTypes = {
  licence: 'licences',
  monitoringStation: 'monitoring stations',
  returnLog: 'return logs'
}

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
    return _blankSearchPage(query, resultType)
  }

  const { exactSearchResults, similarSearchResults } = allSearchMatches

  return {
    exactMatches: _matches(exactSearchResults),
    noPartialResults: similarSearchResults.amountFound === 0,
    noResults: exactSearchResults.amountFound === 0 && similarSearchResults.amountFound === 0,
    page,
    pageTitle: `Search results for "${query}"`,
    pageTitleCaption: _pageTitleCaption(numberOfPages, page),
    partialMatches: _matches(similarSearchResults),
    query,
    resultType,
    resultTypeText: resultTypes[resultType] || 'all matches',
    showExactResults: exactSearchResults.amountFound !== 0,
    showResults: true
  }
}

function _blankSearchPage(query, resultType) {
  return {
    pageTitle: 'Search',
    query,
    resultType,
    showResults: false
  }
}

function _holderContact(licence) {
  return (
    licence.metadata.contacts?.find((contact) => {
      return contact.role === 'Licence holder'
    }) ?? {}
  )
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

    const { forename: firstName, initials, name: lastName, salutation } = _holderContact(licence)

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

function _matches(searchResults) {
  return {
    licences: _licences(searchResults.licences.results),
    monitoringStations: _monitoringStations(searchResults.monitoringStations.results),
    returnLogs: _returnLogs(searchResults.returnLogs.results),
    users: _users(searchResults.users.results)
  }
}

function _monitoringStations(monitoringStations) {
  if (monitoringStations.length === 0) {
    return null
  }

  return monitoringStations
}

function _pageTitleCaption(numberOfPages, selectedPageNumber) {
  if (numberOfPages < 2) {
    return null
  }

  return `Page ${selectedPageNumber} of ${numberOfPages}`
}

function _returnLogDetail(ids, dueDates, endDates, statuses) {
  return ids
    .map((id, index) => {
      const dueDate = dueDates[index]
      const endDate = endDates[index]
      const status = statuses[index]

      return { dueDate, endDate, id, status }
    })
    .sort((a, b) => {
      return b.endDate - a.endDate
    })[0]
}

function _returnLogs(returnLogs) {
  if (returnLogs.length === 0) {
    return null
  }

  return returnLogs.map((returnLog) => {
    const { dueDates, endDates, id: licenceId, ids, licenceRef, returnReference, statuses } = returnLog

    const returnLogDetail = _returnLogDetail(ids, dueDates, endDates, statuses)

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

function _users(users) {
  if (users.length === 0) {
    return null
  }

  return users.map((user) => {
    const { application, id, lastLogin, username } = user

    return {
      id,
      lastLogin: formatLongDate(lastLogin),
      type: application === 'water_vml' ? 'External' : 'Internal',
      username
    }
  })
}

module.exports = {
  go
}
