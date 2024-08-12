'use strict'

/**
 * Orchestrates flagging a licence for supplementary billing
 * @module FlagSupplementaryBillingService
 */

const BillRunModel = require('../../models/bill-run.model.js')
const ChargeVersionModel = require('../../models/charge-version.model.js')
const LicenceSupplementaryYearModel = require('../../models/licence-supplementary-year.model.js')

/**
 * Orchestrates flagging a licence for supplementary billing
 *
 * @param {String} payload -
 */
async function go (payload) {
  if (payload.chargeVersionId) {
    const { chargeReferences, licence, endDate, startDate } = await _getChargeVersion(payload.chargeVersionId)

    const hasTwoPartTariffIndicator = _hasTwoPartTariffIndicators(chargeReferences)

    if (!hasTwoPartTariffIndicator) {
      return
    }

    const years = _getFinancialYears(startDate, endDate)
    const yearsForSupplementaryBilling = await _getSupplementaryBillingYears(years, licence.regionId)

    if (yearsForSupplementaryBilling.length === 0) {
      return
    }

    await _persistSupplementaryBillingYears(yearsForSupplementaryBilling, licence.id)
  }

  // const yearsForSupplementaryBilling = await ChargeVersionFlaggingService.go(payload.chargeVersionId)
}

function _hasTwoPartTariffIndicators (chargeReferences) {
  return chargeReferences.some((chargeReference) => {
    return chargeReference.adjustments
  })
}

async function _getChargeVersion (chargeVersionId) {
  return ChargeVersionModel.query()
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
}

async function _persistSupplementaryBillingYears (yearsForSupplementaryBilling, licenceId) {
  for (const year of yearsForSupplementaryBilling) {
    await LicenceSupplementaryYearModel.query()
      .insert({
        licenceId,
        financialYearEnd: year,
        twoPartTariff: true
      })
  }
}

function _getFinancialYears (startDate, endDate) {
  const lastPreSrocFinancialYearEnd = 2022
  const years = []

  let endYear
  let startYear = startDate.getFullYear()

  // As some charge versions don't have an end date we need to take this into consideration
  if (!endDate) {
    endDate = new Date()
  }

  endYear = endDate.getFullYear()

  // When flagging a licence for the supplementary bill run, we need to consider which financial years have been
  // impacted by the change on the charge version. We only care about the financial year ends. So if the startDate for
  // a new chargeVersion is `2022-05-31`, the financial year end is considered to be `2023` since the financial years
  // run April to March. Same goes for if a charge versions endDate is `2024-04-05`, the financial year end is `2025`.

  // If the month is after April or after, the financial year end is the following year
  if (startDate.getMonth() >= 3) {
    startYear++
  }

  if (endDate.getMonth() >= 3) {
    endYear++
  }

  for (let year = startYear; year <= endYear; year++) {
    // SROC supplementary billing started in the financial year 2022/2023. Anything before this year is not considered
    // to be SROC
    if (year > lastPreSrocFinancialYearEnd) {
      years.push(year)
    }
  }

  return years
}

/**
 * We need to verify which years annual two-part tariff bill runs have been sent. A year shouldn't be flagged for a
 * supplementary bill run if the annual bill run hasn't been sent yet, as any license changes will be handled in the
 * annual run.
 */
async function _getSupplementaryBillingYears (years, regionId) {
  const annualTwoPartTariffYears = []

  for (const year of years) {
    const annualTwoPartTariff = await BillRunModel.query()
      .where('regionId', regionId)
      .where('batchType', 'two_part_tariff')
      .where('status', 'sent')
      .where('toFinancialYearEnding', year)

    if (annualTwoPartTariff.length > 0) {
      annualTwoPartTariffYears.push(year)
    }
  }

  return annualTwoPartTariffYears
}

module.exports = {
  go
}
