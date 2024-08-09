'use strict'

/**
 * Fetches data needed for the view '/licences/{id}` page
 * @module FetchLicenceService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetch the matching licence and return data needed for the view licence page
 *
 * Was built to provide the data needed for the '/licences/{id}' page
 *
 * @param {string} id The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page and some elements of the summary tab
 */
async function go (id) {
  const licence = await _fetchLicence(id)
  const data = await _data(licence)

  return data
}

async function _data (licence) {
  const registeredTo = licence.$registeredTo() ?? null
  const licenceName = registeredTo ? licence.$licenceName() : 'Unregistered licence'

  return {
    ...licence,
    ends: licence.$ends(),
    licenceName,
    registeredTo
  }
}

async function _fetchLicence (id) {
  const result = await LicenceModel.query()
    .findById(id)
    .select([
      'id',
      'include_in_presroc_billing',
      'include_in_sroc_billing',
      'licenceRef',
      'expiredDate',
      'revokedDate',
      'lapsedDate'
    ])
    .withGraphFetched('licenceDocumentHeader')
    .modifyGraph('licenceDocumentHeader', (builder) => {
      builder.select([
        'licenceDocumentHeaders.id',
        'licenceDocumentHeaders.metadata'
      ])
    })
    .modify('registeredToAndLicenceName')
    .withGraphFetched('workflows')
    .modifyGraph('workflows', (builder) => {
      builder.select([
        'workflows.status'
      ])
    })

  return result
}

module.exports = {
  go
}
