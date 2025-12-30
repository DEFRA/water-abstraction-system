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
 * @param {string[]} userScopes - The user's scopes
 * @param {string} query - The user-entered search query, if any
 * @param {string} resultType - The type of search results being displayed
 * @param {string} page - The requested page, when displaying search results
 * @param {string} numberOfPages - The total number of pages available for the search results
 * @param {object} allSearchMatches - All the search matches found, in the same form returned by Objection pagination,
 * i.e. an object with an array of `results` for the current page and a `total` of the full number of matching results
 * in the database
 *
 * @returns {object} - The data formatted for the view template
 */
function go(userScopes, query, resultType, page, numberOfPages, allSearchMatches) {
  // If there's no page number provided, we're just displaying the blank search page, potentially with any search
  // query that the user may have entered but was not searchable, e.g. whitespace or other unsearchable text
  if (!page) {
    return _blankSearchPage(userScopes, query, resultType)
  }

  const { results, total } = allSearchMatches

  return {
    filterItems: _filterItems(userScopes, resultType),
    noResults: total === 0,
    page,
    pageTitle: `Search results for "${query}"`,
    pageTitleCaption: _pageTitleCaption(numberOfPages, page),
    query,
    results: _results(results),
    resultType,
    showResults: true
  }
}

function _billingAccount(billingAccount) {
  const { exact, model } = billingAccount
  const { accountNumber, company, createdAt, id } = model
  const { name } = company

  return {
    col2Title: 'Holder',
    col2Value: name,
    col3Title: 'Created date',
    col3Value: formatLongDate(createdAt),
    exact,
    link: `/system/billing-accounts/${id}`,
    reference: accountNumber,
    statusTag: null,
    type: 'Billing account'
  }
}

function _blankSearchPage(userScopes, query, resultType) {
  return {
    filterItems: _filterItems(userScopes, resultType),
    pageTitle: 'Search',
    query,
    resultType,
    showResults: false
  }
}

function _filterItems(userScopes, resultType) {
  const items = []

  if (userScopes.includes('billing')) {
    items.push({ checked: resultType === 'billingAccount', value: 'billingAccount', text: 'Billing accounts' })
  }

  items.push(
    { checked: resultType === 'licenceHolder', value: 'licenceHolder', text: 'Licence holders' },
    { checked: resultType === 'licence', value: 'licence', text: 'Licences' },
    { checked: resultType === 'monitoringStation', value: 'monitoringStation', text: 'Monitoring stations' },
    { checked: resultType === 'returnLog', value: 'returnLog', text: 'Return logs' },
    { checked: resultType === 'user', value: 'user', text: 'Users' }
  )

  return items
}

function _licenceHolderDetail(licenceDocumentHeader) {
  const licenceHolder =
    licenceDocumentHeader.metadata.contacts?.find((contact) => {
      return contact.role === 'Licence holder'
    }) ?? {}

  // Holder name is either a company name given by Name or made up of any parts of Salutation, Initials, Forename and
  // Name that are populated, where Name provides the surname for a person.
  // Licences that have ended don't seem to have this information populated, which makes their display a bit
  // unhelpful.
  const { forename: firstName, initials, name: lastName, salutation, type } = licenceHolder
  const holderContactModel = ContactModel.fromJson({ firstName, initials, lastName, salutation })

  return {
    holderName: holderContactModel.$name(),
    holderType: type
  }
}

function _licenceEndDetails(licence) {
  const licenceEnd = licence.$ends()

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

function _licence(licence) {
  const { exact, model } = licence
  const { id, licenceDocumentHeader, licenceRef } = model

  const { holderName } = _licenceHolderDetail(licenceDocumentHeader)

  const { licenceEndDate, licenceEndedText } = _licenceEndDetails(model)

  return {
    col2Title: 'Licence holder',
    col2Value: holderName,
    col3Title: 'End date',
    col3Value: licenceEndDate,
    exact,
    link: `/system/licences/${id}/summary`,
    reference: licenceRef,
    statusTag: licenceEndedText,
    type: 'Licence'
  }
}

function _licenceHolder(licenceHolder) {
  const { exact, model } = licenceHolder
  const {
    licence: { id, licenceRef }
  } = model

  const { holderName, holderType } = _licenceHolderDetail(model)

  return {
    col2Title: 'Licence',
    col2Value: licenceRef,
    col3Title: 'Type',
    col3Value: holderType,
    exact,
    link: `/system/licences/${id}/summary`,
    reference: holderName,
    statusTag: null,
    type: 'Holder'
  }
}

function _monitoringStation(monitoringStation) {
  const { exact, model } = monitoringStation
  const { gridReference, id, label, river } = model

  return {
    col2Title: 'River',
    col2Value: river,
    col3Title: 'Grid reference',
    col3Value: gridReference,
    exact,
    link: `/system/monitoring-stations/${id}`,
    reference: label,
    statusTag: null,
    type: 'Monitoring station'
  }
}

function _pageTitleCaption(numberOfPages, selectedPageNumber) {
  if (numberOfPages < 2) {
    return null
  }

  return `Page ${selectedPageNumber} of ${numberOfPages}`
}

function _result(result) {
  switch (result.type) {
    case 'billingAccount':
      return _billingAccount(result)
    case 'licence':
      return _licence(result)
    case 'licenceHolder':
      return _licenceHolder(result)
    case 'monitoringStation':
      return _monitoringStation(result)
    case 'returnLog':
      return _returnLog(result)
    case 'user':
      return _user(result)
    default:
      return null // Any unknown types are returned as null so they can be filtered out
  }
}

function _results(results) {
  return results
    .map((result) => {
      return _result(result)
    })
    .filter(Boolean) // Any unknown types filtered out
}

function _returnLog(returnLog) {
  const { exact, model } = returnLog
  const { endDate, returnId, licenceRef, returnReference } = model

  const statusTag = formatReturnLogStatus(model)

  return {
    col2Title: 'Licence',
    col2Value: licenceRef,
    col3Title: 'End date',
    col3Value: formatLongDate(endDate),
    exact,
    link: `/system/return-logs/${returnId}`,
    reference: returnReference,
    statusTag,
    type: 'Return reference'
  }
}

function _user(user) {
  const { exact, model } = user
  const { application, id, lastLogin, username } = model

  const statusTag = formatReturnLogStatus(model)

  return {
    col2Title: 'Type',
    col2Value: application === 'water_vml' ? 'External' : 'Internal',
    col3Title: 'Last signed in',
    col3Value: formatLongDate(lastLogin),
    exact,
    link: `/user/${id}/status`,
    reference: username,
    statusTag,
    type: 'User'
  }
}

module.exports = {
  go
}
