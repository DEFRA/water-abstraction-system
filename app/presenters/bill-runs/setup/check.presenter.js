'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/check` page
 * @module CheckPresenter
 */

const {
  formatBillRunType,
  formatChargeScheme,
  formatFinancialYear,
  formatLongDate
} = require('../../base.presenter.js')
const RegionModel = require('../../../models/region.model.js')

const LAST_PRESROC_YEAR = 2022

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/check` page
 *
 * @param {module:SessionModel} session - The session instance for the setup bill run journey
 * @param {object} existsResults - The results from `ExistsService`
 *
 * @returns {object} - The data formatted for the view template
 */
async function go(session, existsResults) {
  const { id: sessionId, region } = session

  const { matches, toFinancialYearEnding } = existsResults

  const scheme = _chargeScheme(existsResults)
  const billRunType = _billRunType(session, matches, scheme)

  return {
    backLink: _backLink(session),
    billRunLink: _billRunLink(matches),
    billRunNumber: _billRunNumber(matches),
    billRunStatus: _billRunStatus(matches),
    billRunType,
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: _dateCreated(matches),
    exists: existsResults.matches.length > 0,
    financialYear: existsResults.toFinancialYearEnding === 0 ? null : formatFinancialYear(toFinancialYearEnding),
    pageTitle: _pageTitle(matches, toFinancialYearEnding),
    regionName: await _regionName(matches, region),
    sessionId,
    warningMessage: _warningMessage(matches, toFinancialYearEnding, billRunType)
  }
}

function _backLink(session) {
  const { type, year } = session

  if (!type.startsWith('two_part')) {
    return `/system/bill-runs/setup/${session.id}/region`
  }

  if (type === 'two_part_supplementary' || ['2024', '2023'].includes(year)) {
    return `/system/bill-runs/setup/${session.id}/year`
  }

  return `/system/bill-runs/setup/${session.id}/season`
}

function _billRunLink(matches) {
  if (matches.length === 0) {
    return null
  }

  const { id: billRunId, status, toFinancialYearEnding } = matches[0]

  if (status !== 'review') {
    return `/system/bill-runs/${billRunId}`
  }

  if (toFinancialYearEnding > LAST_PRESROC_YEAR) {
    return `/system/bill-runs/${billRunId}/review`
  }

  return `/billing/batch/${billRunId}/two-part-tariff-review`
}

function _billRunNumber(matches) {
  if (matches.length === 0) {
    return null
  }

  return matches[0].billRunNumber
}

function _billRunStatus(matches) {
  if (matches.length === 0) {
    return null
  }

  return matches[0].status
}

function _billRunType(session, matches, scheme) {
  if (matches.length === 0) {
    return formatBillRunType(session.type, scheme, session.summer)
  }

  const matchingBillRun = matches[0]

  return formatBillRunType(matchingBillRun.batchType, matchingBillRun.scheme, matchingBillRun.summer)
}

function _chargeScheme(existsResults) {
  if (existsResults.matches.length > 0) {
    return existsResults.matches[0].scheme
  }

  if (existsResults.toFinancialYearEnding <= LAST_PRESROC_YEAR) {
    return 'presroc'
  }

  return 'sroc'
}

function _dateCreated(matches) {
  if (matches.length === 0) {
    return null
  }

  return formatLongDate(matches[0].createdAt)
}

function _pageTitle(matches, toFinancialYearEnding) {
  if (toFinancialYearEnding === 0) {
    return 'Cannot create bill run'
  }

  if (matches.length > 0) {
    return 'This bill run already exists'
  }

  return 'Check the bill run to be created'
}

async function _regionName(matches, regionId) {
  if (matches.length > 0) {
    return matches[0].region.displayName
  }

  const regionInstance = await RegionModel.query().select(['id', 'displayName']).findById(regionId)

  return regionInstance.displayName
}

function _warningMessage(matches, toFinancialYearEnding, billRunType) {
  if (toFinancialYearEnding === 0) {
    return 'You cannot create a supplementary bill run for this region until you have created an annual bill run'
  }

  if (matches.length === 0) {
    return null
  }

  const { batchType, status } = matches[0]

  if (batchType === 'supplementary') {
    return 'You need to confirm or cancel this bill run before you can create a new one'
  }

  if (status !== 'sent') {
    return 'You need to cancel this bill run before you can create a new one'
  }

  return `You can only have one ${billRunType} bill run per region in a financial year`
}

module.exports = {
  go
}
