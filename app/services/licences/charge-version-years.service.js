'use strict'

/**
 * Retrieves details about a charge version and determines relevant financial years for supplementary billing
 * @module ChargeVersionYearsService
 */

const ChargeVersionModel = require('../../models/charge-version.model.js')

const MONTHS_UNTIL_FINANCIAL_YEAR_START = 3
const LAST_PRE_SROC_FINANCIAL_YEAR_END = 2022

/**
 * Retrieves details about a charge version and determines relevant financial years for supplementary billing
 *
 * If a `chargeVersionId` is provided, the service fetches the associated charge version details, including charge
 * references and the licence information. It then checks for the presence of two-part tariff indicators within the
 * charge references.
 *
 * If two-part tariff indicators are found, the function calculates the financial years impacted by the charge version's
 * start and end dates. It returns these years along with the associated licence information.
 *
 *
 * @param {String} chargeVersionId - The UUID of the charge version to check
 *
 * @returns {Object} - An object with the impacted years and licence details of that charge version
 */
async function go (chargeVersionId) {
  const { chargeReferences, licence, endDate, startDate } = await _getChargeVersion(chargeVersionId)

  const hasTwoPartTariffIndicator = _hasTwoPartTariffIndicators(chargeReferences)

  if (!hasTwoPartTariffIndicator) {
    return []
  }

  const years = _getFinancialYears(startDate, endDate)

  return {
    years,
    licence
  }
}

async function _getChargeVersion (chargeVersionId) {
  const chargeVersion = await ChargeVersionModel.query()
    .findById(chargeVersionId)
    .withGraphFetched('chargeReferences')
    .modifyGraph('chargeReferences', (builder) => {
      builder.select([
        'id',
        'adjustments'
      ])
    })
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select([
        'id',
        'regionId'
      ])
    })

  return chargeVersion
}

/**
 * When flagging a licence for the supplementary bill run, we need to consider which financial years have been
 * impacted by the change on the charge version. We only care about the financial year ends. So if the startDate for
 * a new chargeVersion is `2022-05-31`, the financial year end is considered to be `2023` since the financial years
 * run April to March. Same goes for if a charge versions endDate is `2024-04-05`, the financial year end is `2025`.
 */
function _getAdjustedFinancialYearEnd (date) {
  let year = date.getFullYear()

  if (date.getMonth() >= MONTHS_UNTIL_FINANCIAL_YEAR_START) {
    year++
  }

  return year
}

function _getFinancialYears (startDate, endDate) {
  const years = []

  const startYear = _getAdjustedFinancialYearEnd(startDate)
  // As some charge versions don't have an end date we need to take this into consideration
  const endYear = _getAdjustedFinancialYearEnd(endDate || new Date())

  for (let year = startYear; year <= endYear; year++) {
    // SROC supplementary billing started in the financial year 2022/2023. Anything before this year is not considered
    // to be SROC
    if (year > LAST_PRE_SROC_FINANCIAL_YEAR_END) {
      years.push(year)
    }
  }

  return years
}

function _hasTwoPartTariffIndicators (chargeReferences) {
  return chargeReferences.some((chargeReference) => {
    return chargeReference.adjustments.s127
  })
}

module.exports = {
  go
}
