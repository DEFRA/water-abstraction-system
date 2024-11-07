'use strict'

const Big = require('big.js')

const { formatLongDate } = require('../../base.presenter.js')
const DetermineAbstractionPeriodService = require('../../../services/bill-runs/determine-abstraction-periods.service.js')

/**
 * Calculates the total allocated volume across all review change elements
 *
 * @param {module:ReviewChargeElementModel[]} reviewChargeElements - array of `ReviewChargeElementModel` instances
 *
 * @returns {string} the sum of allocated volume against all review charge elements without loss of precision
 */
function calculateTotalBillableReturns (reviewChargeElements) {
  return reviewChargeElements.reduce((total, reviewChargeElement) => {
    const { amendedAllocated } = reviewChargeElement

    return Big(total).plus(amendedAllocated).toNumber()
  }, 0)
}

/**
 * Determine the link for a return, for example, should it go to the edit or view page?
 *
 * @param {module:ReviewReturnModel} reviewReturn - instance of `ReviewReturn` to determine the link for
 *
 * @returns {string} the relative URL the view template should use to link to the return
 */
function determineReturnLink (reviewReturn) {
  const { returnId, returnStatus } = reviewReturn

  if (['due', 'received'].includes(returnStatus)) {
    return `/return/internal?returnId=${returnId}`
  }

  return `/returns/return?id=${returnId}`
}

/**
 * Extract and format the additional charges from a charge reference for display
 *
 * If the charge reference has both a supported source and is a public water company then the following is returned.
 *
 * ```javascript
 * const additionalCharges = [
 *   'Supported source foo',
 *   'Public Water Supply'
 * ]
 * ```
 *
 * If it has known an empty array is returned
 *
 * @param {object} chargeReference - an object representing as 'Charge Reference' that has the properties
 * `supportedSourceName` and `waterCompanyCharge`, taken from the charge reference's `additionalCharges` field
 *
 * @returns {string[]} the additional charges (if present) formatted as a string for display
 */
function formatAdditionalCharges (chargeReference) {
  const { supportedSourceName, waterCompanyCharge } = chargeReference

  const additionalCharges = []

  if (supportedSourceName) {
    additionalCharges.push(`Supported source ${supportedSourceName}`)
  }

  if (waterCompanyCharge) {
    additionalCharges.push('Public Water Supply')
  }

  return additionalCharges
}

/**
 * Extract and format the adjustments (excluding aggregate and charge adjustment) from a charge reference for display
 *
 * If the charge reference has adjustments, for example, an abatement and two-part tariff agreement then the following
 * is returned.
 *
 * ```javascript
 * const agreements = [
 *   'Abatement agreement 0.8',
 *   'Two part tariff agreement'
 * ]
 * ```
 *
 * We exclude aggregate and charge adjustment because the review screens have functionality to allow users to edit these
 * values when they have been applied to a charge reference. Therefore they are handled separately.
 *
 * @param {module:ReviewChargeReferenceModel} reviewChargeReference - instance of `ReviewChargeReferenceModel` to format
 * the adjustments for
 *
 * @returns {string[]} the adjustments (if present) formatted as a string for display
 */
function formatAdjustments (reviewChargeReference) {
  const adjustments = []

  if (reviewChargeReference.abatementAgreement && reviewChargeReference.abatementAgreement !== 1) {
    adjustments.push(`Abatement agreement (${reviewChargeReference.abatementAgreement})`)
  }

  if (reviewChargeReference.winterDiscount) {
    adjustments.push('Winter discount')
  }

  if (reviewChargeReference.twoPartTariffAgreement) {
    adjustments.push('Two part tariff agreement')
  }

  if (reviewChargeReference.canalAndRiverTrustAgreement) {
    adjustments.push('Canal and River trust agreement')
  }

  return adjustments
}

/**
 * Formats the charge period into its string variant, for example, '1 April 2023 to 10 October 2023'
 *
 * @param {module:ReviewChargeVersionModel} reviewChargeVersion - instance of `ReviewChargeVersionModel` to format the
 * charge period for
 *
 * @returns {string} The review charge version's charge period formatted as a 'DD MMMM YYYY to DD MMMM YYYY' string
 */
function formatChargePeriod (reviewChargeVersion) {
  const chargePeriod = _chargePeriod(reviewChargeVersion)

  return `${formatLongDate(chargePeriod.startDate)} to ${formatLongDate(chargePeriod.endDate)}`
}

/**
 * Determine the charge periods for a `ReviewChargeElementModel` and format them for display
 *
 * If the charge period is known, for example, the review licence presenter determines first and then passes it to
 * various functions, then this can be provided. Else the function will assume the `ReviewChargeElementModel` instance
 * contains a `reviewChargeReference` property that then contains a `reviewChargeVersion`. The charge period will be
 * determined by extracting the start and end date from it.
 *
 * With the abstraction details and charge period determined, it calls `DetermineAbstractionPeriodService` to calculate
 * the charge periods for the _element_. An element can have 1 or 2 charge periods, due to the way abstraction periods
 * and financial years cross-over.
 *
 * With these calculated, they are passed through `formatLongDate()` and return for display in the UI.
 *
 * @param {module:ReviewChargeElementModel} reviewChargeElement - instance of `ReviewChargeElementModel` containing at
 * least a `chargeElement` property populated with abstraction days and months
 * @param {object} [chargePeriod] - The start and end date of the calculated charge period
 *
 * @returns {string[]} an array containing the review charge element's charge period(s) formatted as 'DD MMMM YYYY to DD
 * MMMM YYYY'
 */
function formatChargePeriods (reviewChargeElement, chargePeriod = null) {
  const { chargeElement, reviewChargeReference } = reviewChargeElement

  const {
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  } = chargeElement

  if (!chargePeriod) {
    chargePeriod = _chargePeriod(reviewChargeReference.reviewChargeVersion)
  }

  const abstractionPeriods = DetermineAbstractionPeriodService.go(
    chargePeriod,
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth
  )

  return abstractionPeriods.map((abstractionPeriod) => {
    const { endDate, startDate } = abstractionPeriod

    return `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`
  })
}

/**
 * Formats the issues held against review charge elements and returns for display
 *
 * TODO: Use NULL for no issues not an empty string
 *
 * An oversight when setting up the table/logic means 'issues' in `review_returns` and `review_charge_elements` is never
 * null. If there are no issues we are setting it to an empty string not NULL. This means we always get a string back
 * from the DB.
 *
 * @param {string} issues - the issues from the review charge element or return as a comma separated string
 *
 * @returns {string[]} the issues as a string array, else an empty array if issues is equal to ''
 */
function formatIssues (issues) {
  if (issues === '') {
    return []
  }

  return issues.split(', ')
}

/**
 * Format the status for a review return, for example, 'overdue'
 *
 * We cannot just return the status from the DB for a return because of the disparity between what we show and how the
 * status is stored. For example, the status field in the DB holds completed, due, received, and void. When the review
 * screens display the return we can assume anything with a status of `due` is overdue, hence the first disparity.
 *
 * The other is that if a return is under query this is not reflected in the status. Instead, a flag is set in a
 * different field.
 *
 * @param {module:ReviewReturnModel} reviewReturn - instance of `ReviewReturn` to format the status for
 *
 * @returns {string} the return's status formatted for display
 */
function formatReturnStatus (reviewReturn) {
  const { returnStatus, underQuery } = reviewReturn

  if (returnStatus === 'due') {
    return 'overdue'
  }

  if (underQuery) {
    return 'query'
  }

  return reviewReturn.returnStatus
}

/**
 * Format the total allocated vs quantity for a review return, for example, '15.5 ML / 20 ML'
 *
 * @param {module:ReviewReturnModel} reviewReturn - instance of `ReviewReturn` to format the totals for
 *
 * @returns the return's totals formatted for display
 */
function formatReturnTotals (reviewReturn) {
  const { allocated, quantity, returnStatus } = reviewReturn

  if (['due', 'received'].includes(returnStatus)) {
    return '/'
  }

  return `${allocated} ML / ${quantity} ML`
}

function _chargePeriod (reviewChargeVersion) {
  const { chargePeriodStartDate, chargePeriodEndDate } = reviewChargeVersion

  return { startDate: chargePeriodStartDate, endDate: chargePeriodEndDate }
}

module.exports = {
  calculateTotalBillableReturns,
  determineReturnLink,
  formatAdditionalCharges,
  formatAdjustments,
  formatChargePeriod,
  formatChargePeriods,
  formatIssues,
  formatReturnStatus,
  formatReturnTotals
}
