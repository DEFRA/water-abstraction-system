'use strict'

/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/contact-details` page
 * @module FetchLicenceContactDetailsService
 */

const LicenceDocumentRoleModel = require('../../models/licence-document-role.model')
const LicenceModel = require('../../models/licence.model')

/**
 * Fetches all bills for a licence which is needed for the view '/licences/{id}/contact-details` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's bills tab
 */
async function go (licenceId) {
  const { licenceContacts } = await _fetch(licenceId)

  return { licenceContacts }
}

async function _fetch (licenceId) {
  const licences = await LicenceModel.query().findOne({
    'licences.id': licenceId
  }).withGraphFetched('licenceDocument')

  const licenceContacts = await LicenceDocumentRoleModel.query()
    .where(function () {
      this.where('end_date', '>', new Date()).orWhere({ end_date: null })
    })
    .andWhere({ licence_document_id: licences.licenceDocument.id })
    .select('')
    .withGraphFetched('licenceRole')
    .modifyGraph('licenceRole', (builder) => {
      builder.select(['name', 'label'])
    })
    .withGraphFetched('address')
    .modifyGraph('address', (builder) => {
      builder.select([
        'address1', 'address2', 'address3',
        'address4', 'country', 'postcode'])
    })
    .withGraphFetched('contact')
    .modifyGraph('contact', (builder) => {
      builder.select(['first_name', 'last_name'])
    })
    .withGraphFetched('company')
    .modifyGraph('company', (builder) => {
      builder.select(['id', 'name'])
    })

  return {
    licenceContacts
  }
}

module.exports = {
  go
}
