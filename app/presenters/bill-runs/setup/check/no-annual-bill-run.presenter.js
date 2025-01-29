'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/check` page when the financial year could not be determined
 * @module NoAnnualBillRunPresenter
 */

const { formatBillRunType, formatChargeScheme } = require('../../../base.presenter.js')
const { checkPageBackLink } = require('./base-check.presenter.js')

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/check` page when the financial year could not be determined
 *
 * This will never happen in `production` but can happen in non-production environments.
 *
 * You can only create a supplementary bill run for a financial year where the annual bill run has been sent. But users
 * still want to be able to raise supplementary bill runs for changes that have been to in previous years.
 *
 * Therefore, the supplementary bill run process includes functionality that determines what the latest financial year
 * it can be generated for. For example, if its 2024/25 and the annual Midlands bill run has not been generated, then
 * any Midlands supplementary bill run will use the financial year end 2023/24.
 *
 * In production, at most we'll only ever be a year behind. In non-production though all bets are off!
 *
 * The QA team might have cleared all billing history. Or a new member of the team might be working with a fresh
 * environment that contains no bill runs. If this is the case then we won't be able to determine a financial year for
 * the supplementary bill run.
 *
 * We used to just let the setup process error at that point: it's not a scenario that would ever happen in production
 * so why guard against it? Unfortunately, it became common for the dev team to be asked to look at an error in billing
 * only to find it was this scenario. So, now we have logic to display a specific error message if this is the case.
 *
 * @param {module:SessionModel} session - The session instance for the setup bill run journey
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { id: sessionId, regionName } = session

  return {
    backLink: checkPageBackLink(session),
    billRunLink: null,
    billRunNumber: null,
    billRunStatus: null,
    billRunType: formatBillRunType(session.type, 'sroc', session.summer),
    chargeScheme: formatChargeScheme('sroc'),
    dateCreated: null,
    financialYearEnd: null,
    pageTitle: 'This bill run is blocked',
    regionName,
    sessionId,
    showCreateButton: false,
    warningMessage:
      'You cannot create a supplementary bill run for this region until you have created an annual bill run'
  }
}

module.exports = {
  go
}
