'use strict'

/**
 * Fetches data needed for the view '/licences/{id}` page
 * @module FetchLicenceReturnsService
 */

const LicenceModel = require('../../models/licence.model.js')
const ReturnLogModel = require('../../models/return-log.model')
const DatabaseConfig = require('../../../config/database.config')

/**
 * Fetch the matching licence and return data needed for the view licence page
 *
 * Was built to provide the data needed for the '/licences/{id}' page
 *
 * @param {string} id The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page and some elements of the summary tab
 */
async function go (id, page) {
  const licence = await _fetchLicence(id, page)
  const data = await _data(licence)

  return data
}

async function _data ({ results, total }) {
  return { returns: results, pagination: { total } }
}

async function _fetchLicence (id, page) {
  const licenseData = await LicenceModel.query()
    .findById(id)
    .select([
      'licenceRef'
    ])

  //  order by due date
  const result = await ReturnLogModel.query()
    .select([
      'id',
      'start_date',
      'end_date',
      'dueDate',
      'status',
      'metadata',
      'return_reference'
    ])
    .where('licence_ref', licenseData.licenceRef)
    .orderBy([
      { column: 'dueDate', order: 'desc' }
    ])
    .page(page - 1, DatabaseConfig.defaultPageSize)

  return result
}

module.exports = {
  go
}
