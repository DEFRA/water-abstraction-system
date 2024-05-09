'use strict'

/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/contact-details` page
 * @module FetchLicenceContactDetailsService
 */

const LicenceDocumentModel = require('../../models/licence-document.model')

/**
 * Fetches all contact details for a licence which is needed for the view '/licences/{id}/contact-details` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's contact details tab
 */
async function go (licenceId) {
  const { licenceContacts } = await _fetch(licenceId)

  return { licenceContacts: licenceContacts.licenceDocumentRoles }
}

async function _fetch (licenceId) {
  const licenceContacts = await LicenceDocumentModel.query()
    .first()
    .select('')
    .innerJoinRelated('licence')
    .where('licence.id', licenceId)
    .withGraphFetched('licenceDocumentRoles')
    .modifyGraph('licenceDocumentRoles', (builder) => {
      builder.where(function () {
        this.where('end_date', '>', new Date()).orWhere({ end_date: null })
      }).select('')
    })
    .withGraphFetched('licenceDocumentRoles.licenceRole')
    .modifyGraph('licenceDocumentRoles.licenceRole', (builder) => {
      builder.select(['name', 'label'])
    })
    .withGraphFetched('licenceDocumentRoles.address')
    .modifyGraph('licenceDocumentRoles.address', (builder) => {
      builder.select([
        'address1', 'address2', 'address3',
        'address4', 'address5', 'address6',
        'country', 'postcode'])
    })
    .withGraphFetched('licenceDocumentRoles.contact')
    .modifyGraph('contact', (builder) => {
      builder.select(['first_name', 'last_name'])
    })
    .withGraphFetched('licenceDocumentRoles.company')
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
