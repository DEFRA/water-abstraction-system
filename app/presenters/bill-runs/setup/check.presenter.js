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
const { engineTriggers } = require('../../../lib/static-lookups.lib.js')

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

  const { matches, toFinancialYearEnding, trigger } = existsResults

  const scheme = _chargeScheme(matches, trigger)
  const billRunType = _billRunType(session, matches, scheme)
  const messages = _messages(matches, toFinancialYearEnding, trigger, billRunType)

  return {
    backLink: _backLink(session),
    billRunLink: _billRunLink(matches),
    billRunNumber: _billRunNumber(matches),
    billRunStatus: _billRunStatus(matches),
    billRunType,
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: _dateCreated(matches),
    financialYear: existsResults.toFinancialYearEnding === 0 ? null : formatFinancialYear(toFinancialYearEnding),
    pageTitle: messages.title,
    regionName: await _regionName(matches, region),
    sessionId,
    showCreateButton: trigger !== engineTriggers.neither,
    warningMessage: messages.warning
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
    return `/system/bill-runs/review/${billRunId}`
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

function _chargeScheme(matches, trigger) {
  if (trigger === engineTriggers.neither && matches.length > 0) {
    return matches[0].scheme
  }

  if (trigger === engineTriggers.old) {
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

function _messages(matches, toFinancialYearEnding, trigger, billRunType) {
  if (toFinancialYearEnding === 0) {
    return {
      title: 'This bill run is blocked',
      warning: 'You cannot create a supplementary bill run for this region until you have created an annual bill run'
    }
  }

  if (trigger !== engineTriggers.neither) {
    return {
      title: 'Check the bill run to be created',
      warning: null
    }
  }

  const { batchType, status } = matches[0]

  if (batchType === 'supplementary') {
    return {
      title: 'This bill run is blocked',
      warning: 'You need to confirm or cancel the existing bill run before you can create a new one'
    }
  }

  if (status !== 'sent') {
    return {
      title: 'This bill run already exists',
      warning: 'You need to cancel the existing bill run before you can create a new one'
    }
  }

  return {
    title: 'This bill run already exists',
    warning: `You can only have one ${billRunType} bill run per region in a financial year`
  }
}

async function _regionName(matches, regionId) {
  if (matches.length > 0) {
    return matches[0].region.displayName
  }

  const regionInstance = await RegionModel.query().select(['id', 'displayName']).findById(regionId)

  return regionInstance.displayName
}

module.exports = {
  go
}
