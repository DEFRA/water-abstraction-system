'use strict'

/**
 * Formats data for the return form
 * @module PrepareReturnFormsPresenter
 */

const NotifyAddressPresenter = require('./notify-address.presenter.js')
const { formatLongDate } = require('../../base.presenter.js')
const { naldAreaCodes, returnRequirementFrequencies } = require('../../../lib/static-lookups.lib.js')

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
 * @param {object} recipient
 *
 * @returns {object} - The data formatted for the return form
 */
function go(session, dueReturnLog, recipient) {
  const { licenceRef } = session

  const {
    dueDate,
    endDate,
    naldAreaCode,
    purpose,
    regionName,
    returnsFrequency,
    returnReference,
    siteDescription,
    startDate,
    twoPartTariff
  } = dueReturnLog

  return {
    address: _address(recipient),
    siteDescription,
    dueDate: formatLongDate(new Date(dueDate)),
    endDate: formatLongDate(new Date(endDate)),
    licenceRef,
    purpose,
    regionAndArea: _regionAndArea(regionName, naldAreaCode),
    returnReference,
    startDate: formatLongDate(new Date(startDate)),
    pageTitle: _pageTitle(returnsFrequency),
    twoPartTariff
  }
}

function _address(recipient) {
  return NotifyAddressPresenter.go(recipient.contact)
}

/**
 * The legacy code accounts for the 'nald.areaCode' not being set in the metadata. This logic replicates the legacy
 * logic.
 *
 * @private
 */
function _regionAndArea(regionName, naldAreaCode) {
  if (naldAreaCode) {
    return `${regionName} / ${naldAreaCodes[naldAreaCode]}`
  }

  return regionName
}

function _pageTitle(returnsFrequency) {
  return `Water abstraction ${returnRequirementFrequencies[returnsFrequency]} return`
}

module.exports = {
  go
}
