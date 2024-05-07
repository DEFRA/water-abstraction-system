'use strict'

/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/returns` page
 * @module FetchLicenceBillsService
 */

const LicenceModel = require('../../models/licence.model')
const BillLicenceModel = require('../../models/bill-licence.model')
const BillModel = require('../../models/bill.model')

const DatabaseConfig = require('../../../config/database.config')

/**
 * Fetches all bills for a licence which is needed for the view '/licences/{id}/bills` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's returns tab
 */
async function go (licenceId, page) {
  const { results, total } = await _fetch(licenceId, page)

  return { bills: JSON.parse(JSON.stringify(results)), pagination: { total } }
}

async function _fetch (licenceId, page) {
  const licence = await LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'licenceRef'
    ])

  const billLicences = await BillLicenceModel.query()
    .select('*')
    .where('billLicences.licence_ref', licence.licenceRef)
    .page(page - 1, DatabaseConfig.defaultPageSize)

  const billIds = JSON.parse(JSON.stringify(billLicences)).results.map(b => b.billId)

  return BillModel.query()
    .findByIds(billIds)
    .select('*')
    // .where('bills.billing_account_id', billLicence.billId)
    .orderBy([
      { column: 'created_at', order: 'desc' }
    ])
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
