'use strict'

/**
 * Fetches data needed for the view `/return-requirements/{sessionId}/check-your-answers` page
 * @module FetchLicenceService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetch the matching licence and return data needed for the check your answers page
 *
 * Was built to provide the data needed for the '/return-requirements/{id}/check-your-answers' page
 *
 * @param {string} id The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed for "check your answers" page when user submits for approval
 */
async function go (id) {
  const licence = await _fetchLicence(id)
  const data = _data(licence)

  return data
}

function _data (licence) {
  return {
    ...licence,
    ends: licence.$ends()
  }
}

async function _fetchLicence (id) {
  return LicenceModel.query()
    .findById(id)
    .select([
      'expiredDate',
      'id',
      'lapsedDate',
      'licenceRef',
      'revokedDate',
      'startDate'
    ])
}

module.exports = {
  go
}
