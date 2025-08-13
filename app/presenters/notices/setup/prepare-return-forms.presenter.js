'use strict'

/**
 * Formats data for the return form
 * @module PrepareReturnFormsPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Formats data for the return form
 *
 * The return form has multiple pages and some complex logic / data.
 *
 * Each page will be assigned a corresponding object to isolate the data to each page where possible. Those pages are:
 * - The "cover" page, this is the first page. The address is on this page.
 *
 * @param {SessionModel} session - The session instance
 * @param {object} dueReturnLog
 *
 * @returns {object} - The data formatted for the return form
 */
function go(session, dueReturnLog) {
  const { licenceRef } = session

  const { dueDate, endDate, purpose, returnsFrequency, returnReference, siteDescription, startDate, twoPartTariff } =
    dueReturnLog

  return {
    address: _address(),
    siteDescription,
    dueDate: formatLongDate(new Date(dueDate)),
    endDate: formatLongDate(new Date(endDate)),
    licenceRef,
    purpose,
    regionAndArea: 'A place / in the sun',
    returnReference,
    startDate: formatLongDate(new Date(startDate)),
    pageTitle: _pageTitle(returnsFrequency),
    twoPartTariff
  }
}

function _address() {
  return {
    addressLine1: 'Sherlock Holmes',
    addressLine2: '221B Baker Street',
    addressLine3: 'London',
    addressLine4: 'NW1 6XE',
    addressLine5: 'United Kingdom'
  }
}

function _pageTitle(returnsFrequency) {
  const mapper = {
    day: 'daily',
    month: 'monthly',
    quarter: 'quarterly',
    week: 'weekly',
    year: 'yearly'
  }

  return `Water abstraction ${mapper[returnsFrequency]} return`
}

module.exports = {
  go
}
