'use strict'

/**
 * Formats data for a standard charge transaction for the bill-licence page
 * @module ViewStandardChargeTransactionPresenter
 */

const {
  capitalize,
  formatAbstractionPeriod,
  formatLongDate,
  formatMoney,
  formatPounds
} = require('../base.presenter.js')

/**
 * Formats data for standard charge transaction for the bill-licence page
 *
 * The format of the object the presenter returns will differ depending on the scheme the transaction is for.
 *
 * @param {module:TransactionModel} transaction an instance of `TransactionModel` that represents a compensation charge
 * transaction
 *
 * @returns {Object} a formatted representation of the transaction specifically for the bill-licence page
 */
function go (transaction) {
  if (transaction.scheme === 'sroc') {
    return _srocContent(transaction)
  }

  return _presrocContent(transaction)
}

function _additionalCharges (credit, waterCompanyCharge, supportedSourceCharge, supportedSourceName) {
  const charges = []

  if (supportedSourceName) {
    const chargeInPounds = formatPounds(supportedSourceCharge)

    charges.push(`Supported source ${supportedSourceName} (£${chargeInPounds})`)
  }

  if (waterCompanyCharge) {
    charges.push('Public Water Supply')
  }

  return charges.join(', ')
}

function _adjustments (
  adjustmentFactor,
  aggregateFactor,
  winterOnly,
  section126Factor,
  section127Agreement,
  section130Agreement
) {
  const adjustments = []

  if (aggregateFactor !== 1) {
    adjustments.push(`Aggregate factor (${aggregateFactor})`)
  }

  if (adjustmentFactor !== 1) {
    adjustments.push(`Adjustment factor (${adjustmentFactor})`)
  }

  if (section126Factor !== 1) {
    adjustments.push(`Abatement factor (${section126Factor})`)
  }

  if (section127Agreement) {
    adjustments.push('Two-part tariff (0.5)')
  }

  if (section130Agreement === 'true') {
    adjustments.push('Canal and River Trust (0.5)')
  }

  if (winterOnly) {
    adjustments.push('Winter discount (0.5)')
  }

  return adjustments.join(', ')
}

function _agreement (section127Agreement) {
  if (section127Agreement) {
    return 'Two-part tariff'
  }

  return null
}

function _chargeElement (purpose, startDay, startMonth, endDay, endMonth, source, season, loss) {
  return {
    purpose: purpose.description,
    abstractionPeriod: formatAbstractionPeriod(startDay, startMonth, endDay, endMonth),
    source: capitalize(source),
    season: capitalize(season),
    loss: capitalize(loss)
  }
}

function _chargeElements (chargeElements) {
  return chargeElements.map((chargeElement) => {
    const {
      abstractionPeriodEndDay: endDay,
      abstractionPeriodEndMonth: endMonth,
      abstractionPeriodStartDay: startDay,
      abstractionPeriodStartMonth: startMonth,
      authorisedAnnualQuantity,
      purpose
    } = chargeElement

    return {
      purpose: purpose.description,
      abstractionPeriod: formatAbstractionPeriod(startDay, startMonth, endDay, endMonth),
      volume: `${authorisedAnnualQuantity}ML`
    }
  })
}

function _chargeReference (baselineCharge, chargeCategoryCode) {
  return `${chargeCategoryCode} (£${formatPounds(baselineCharge)})`
}

function _presrocContent (transaction) {
  const {
    authorisedDays,
    billableDays,
    chargeReference,
    chargeType,
    description,
    endDate,
    credit,
    loss,
    netAmount,
    season,
    section127Agreement,
    source,
    startDate,
    volume,
    abstractionPeriodEndDay: endDay,
    abstractionPeriodEndMonth: endMonth,
    abstractionPeriodStartDay: startDay,
    abstractionPeriodStartMonth: startMonth
  } = transaction

  return {
    agreement: _agreement(section127Agreement),
    billableDays: `${billableDays}/${authorisedDays}`,
    chargeElement: _chargeElement(
      chargeReference.purpose,
      startDay,
      startMonth,
      endDay,
      endMonth,
      source,
      season,
      loss
    ),
    chargePeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    chargeType,
    creditAmount: credit ? formatMoney(netAmount) : '',
    debitAmount: credit ? '' : formatMoney(netAmount),
    description,
    quantity: `${volume}ML`
  }
}

function _srocContent (transaction) {
  const {
    adjustmentFactor,
    aggregateFactor,
    authorisedDays,
    baselineCharge,
    billableDays,
    chargeCategoryCode,
    chargeCategoryDescription,
    chargeReference,
    chargeType,
    description,
    endDate,
    credit,
    waterCompanyCharge,
    winterOnly,
    netAmount,
    section126Factor,
    section127Agreement,
    section130Agreement,
    startDate,
    supportedSourceCharge,
    supportedSourceName,
    volume
  } = transaction

  // NOTE: These charges are returned from the Rules Service (via the Charging Module API) in pounds not pence. This is
  // different to all other values we have to deal with. So, we have to convert the values before passing them to our
  // formatter as it expects the values to be in pence.
  const baselineChargeInPence = baselineCharge * 100
  const supportedSourceChargeInPence = supportedSourceCharge * 100

  return {
    additionalCharges: _additionalCharges(credit, waterCompanyCharge, supportedSourceChargeInPence, supportedSourceName),
    adjustments: _adjustments(
      adjustmentFactor,
      aggregateFactor,
      winterOnly,
      section126Factor,
      section127Agreement,
      section130Agreement
    ),
    billableDays: `${billableDays}/${authorisedDays}`,
    chargeCategoryDescription,
    chargeElements: _chargeElements(chargeReference.chargeElements),
    chargePeriod: `${formatLongDate(startDate)} to ${formatLongDate(endDate)}`,
    chargeReference: _chargeReference(baselineChargeInPence, chargeCategoryCode),
    chargeType,
    creditAmount: credit ? formatMoney(netAmount) : '',
    debitAmount: credit ? '' : formatMoney(netAmount),
    description,
    quantity: `${volume}ML`
  }
}

module.exports = {
  go
}
