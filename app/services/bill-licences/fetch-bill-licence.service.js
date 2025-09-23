'use strict'

/**
 * Fetches data needed for the bill licence page which lists all transactions in a bill licence
 * @module FetchBillLicenceService
 */

const { ref } = require('objection')

const BillLicenceModel = require('../../models/bill-licence.model.js')

/**
 * Fetch the matching Bill Licence plus its transactions
 *
 * Was built to provide the data needed for the '/bill-licences/{id}' page
 *
 * @param {string} id - The UUID for the bill licence to fetch
 *
 * @returns {Promise<object>} the matching instance of BillLicenceModel plus the linked bill and bill run. Also all
 * transactions linked to the bill licence and their linked charge reference details
 */
async function go(id) {
  return _fetchBillLicence(id)
}

async function _fetchBillLicence(id) {
  const results = await BillLicenceModel.query()
    .findById(id)
    .select(['id', 'licenceId', 'licenceRef'])
    .withGraphFetched('bill')
    .modifyGraph('bill', (builder) => {
      builder.select(['id', 'accountNumber'])
    })
    .withGraphFetched('bill.billRun')
    .modifyGraph('bill.billRun', (builder) => {
      builder.select(['id', 'batchType', 'scheme', 'source', 'status'])
    })
    .withGraphFetched('transactions')
    .modifyGraph('transactions', (builder) => {
      builder
        .select([
          'id',
          'aggregateFactor',
          'adjustmentFactor',
          'authorisedDays',
          'billableDays',
          'chargeCategoryCode',
          'chargeCategoryDescription',
          'chargeType',
          'description',
          'endDate',
          'credit',
          'waterCompanyCharge',
          'winterOnly',
          'loss',
          'netAmount',
          'scheme',
          'season',
          'section126Factor',
          'section127Agreement',
          'section130Agreement',
          'source',
          'startDate',
          'supportedSourceName',
          'volume',
          ref('grossValuesCalculated:baselineCharge').castDecimal().as('baselineCharge'),
          ref('abstractionPeriod:startDay').castInt().as('abstractionPeriodStartDay'),
          ref('abstractionPeriod:startMonth').castInt().as('abstractionPeriodStartMonth'),
          ref('abstractionPeriod:endDay').castInt().as('abstractionPeriodEndDay'),
          ref('abstractionPeriod:endMonth').castInt().as('abstractionPeriodEndMonth'),
          ref('grossValuesCalculated:supportedSourceCharge').castDecimal().as('supportedSourceChargeValue'),
          ref('grossValuesCalculated:waterCompanyCharge').castDecimal().as('waterCompanyChargeValue')
        ])
        .orderBy([
          { column: 'chargeCategoryCode', order: 'desc' },
          { column: 'billableDays', order: 'desc' },
          { column: 'createdAt', order: 'asc' }
        ])
    })
    .withGraphFetched('transactions.chargeReference')
    .modifyGraph('transactions.chargeReference', (builder) => {
      builder.select(['id'])
    })
    .withGraphFetched('transactions.chargeReference.purpose')
    .modifyGraph('transactions.chargeReference.purpose', (builder) => {
      builder.select(['id', 'description'])
    })
    .withGraphFetched('transactions.chargeReference.chargeElements')
    .modifyGraph('transactions.chargeReference.chargeElements', (builder) => {
      builder.select([
        'id',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth',
        'authorisedAnnualQuantity'
      ])
    })
    .withGraphFetched('transactions.chargeReference.chargeElements.purpose')
    .modifyGraph('transactions.chargeReference.chargeElements.purpose', (builder) => {
      builder.select(['id', 'description'])
    })

  return results
}

module.exports = {
  go
}
