'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/check` page when the bill run is allowed to be created
 * @module AllowBillRunPresenter
 */

const { checkPageBackLink } = require('./base-check.presenter.js')
const { formatBillRunType, formatChargeScheme } = require('../../../billing.presenter.js')
const { engineTriggers } = require('../../../../lib/static-lookups.lib.js')

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/check` page when the bill run is allowed to be created
 *
 * @param {module:SessionModel} session - The session instance for the setup bill run journey
 * @param {object} blockingResults - The results from `DetermineBlockingBillRunService`
 *
 * @returns {object} - The data formatted for the /check view template
 */
function go(session, blockingResults) {
  const { id: sessionId, regionName } = session

  const { toFinancialYearEnding, trigger } = blockingResults

  const scheme = trigger === engineTriggers.old ? 'presroc' : 'sroc'
  const billRunType = formatBillRunType(session.type, scheme, session.summer)

  return {
    backLink: checkPageBackLink(session),
    billRunLink: null,
    billRunNumber: null,
    billRunStatus: null,
    billRunType,
    chargeScheme: _chargeScheme(trigger),
    dateCreated: null,
    financialYearEnd: toFinancialYearEnding,
    pageTitle: 'Check the bill run to be created',
    regionName,
    sessionId,
    showCreateButton: true,
    warningMessage: null
  }
}

function _chargeScheme(trigger) {
  if (trigger === engineTriggers.both) {
    return 'Both'
  }

  const scheme = trigger === engineTriggers.old ? 'presroc' : 'sroc'

  return formatChargeScheme(scheme)
}

module.exports = {
  go
}
