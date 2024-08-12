'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence contact details link page
 * @module ViewLicenceContactService
 */
const CustomerContactsPresenter = require('../../presenters/licences/licence-contact.presenter.js')
const FetchLicenceContactService = require('./fetch-licence-contact.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence contact details link page
 *
 * @param {string} id - The UUID of the licence
 *
 */



async function go (id) {
  const licenceContact = await FetchLicenceContactService.go(id)
  const licenceContactData = await CustomerContactsPresenter.go(licenceContact)

  return licenceContactData
}
module.exports = {
  go
}
