'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the view licence contact details link page
 * @module ViewLicenceContactService
 */

const FetchLicenceContactService = require('./fetch-licence-contact.service.js')

/**
 * Orchestrates fetching and presenting the data needed for the licence contact details link page
 *
 * @param {string} id - The UUID of the licence
 *
 */



async function go (id) {
  const licenceData = await FetchLicenceContactService.go(id)

  return licenceData
}
module.exports = {
  go
}
