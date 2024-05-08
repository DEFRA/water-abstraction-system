'use strict'

/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/contact-details` page
 * @module FetchLicenceContactDetailsService
 */

const ContactModel = require('../../models/contact.model')
const LicenceDocumentRoleModel = require('../../models/licence-document-role.model')
const LicenceModel = require('../../models/licence.model')
const AddressModel = require('../../models/address.model')

/**
 * Fetches all bills for a licence which is needed for the view '/licences/{id}/contact-details` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's bills tab
 */
async function go (licenceId) {
  const {
    licenceContacts,
    customerContacts
  } = await _fetch(licenceId)

  return { licenceContacts, customerContacts }
}

async function _fetch (licenceId) {
  const licences = await LicenceModel.query().findOne({
    'licences.id': licenceId
  }).withGraphFetched('licenceDocument')
  // return ContactModel.query()
  //   .select('*')
  //   .innerJoinRelated('licences')
  //   .where('licences.id', licenceId)

  const licenceContacts = await LicenceDocumentRoleModel.query().where({
    licence_document_id: licences.licenceDocument.id
  })
    // roles.role_id as role_id,
    //   roles.name as role_name,
    //   roles.label as role_label,
    .withGraphFetched('licenceRole')
    .modifyGraph('licenceRole', (builder) => {
      builder.select([
        'id', 'name', 'label'])
    })
    //   addresses.address_id,
    //   addresses.address_1,
    //   addresses.address_2,
    //   addresses.address_3,
    //   addresses.address_4,
    //   addresses.town, - not in db ?
    //   addresses.county, - not in db ?
    //   addresses.country,
    //   addresses.postcode
    .withGraphFetched('address')
    .modifyGraph('address', (builder) => {
      builder.select([
        'id', 'address1', 'address2', 'address3',
        'address4', 'country', 'postcode'])
    })
    //   contacts.contact_id,
    //   contacts.salutation,
    //   contacts.first_name,
    //   contacts.last_name,
    .withGraphFetched('contact')
    .modifyGraph('contact', (builder) => {
      builder.select(['id', 'salutation', 'first_name', 'last_name'])
    })
    //   companies.company_id,
    //   companies.name,
    //   companies.type,
    .withGraphFetched('company')
    .modifyGraph('company', (builder) => {
      builder.select(['name', 'id', 'type'])
    })

  // const customerContacts = await LicenceDocumentRoleModel.query().where({
  //   licence_document_id: licences.licenceDocument.id
  // })
  //   .withGraphFetched('address')
  //   .withGraphFetched('contact')

  return {
    licenceContacts,
    customerContacts: []
  }
}

module.exports = {
  go
}
