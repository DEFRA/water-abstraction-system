'use strict'

/**
 * Initiates the session record used for setting up an existing company contact
 * @module InitiateEditSessionService
 */

const FetchCompanyContactService = require('./fetch-company-contact.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Initiates the session record used for setting up an existing company contact
 *
 * @param {string} companyContactId - the UUID of the company contact
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(companyContactId) {
  const companyContact = await FetchCompanyContactService.go(companyContactId)

  return SessionModel.query()
    .insert({
      data: _formatDataForJourney(companyContact)
    })
    .returning('id')
}

/**
 * The data needs to be formatted to fit into the existing journey.
 *
 * Simple structure changes and renaming.
 *
 * The company contact object is also added to the session data. This will be needed to update the company contact
 * record and the contact record.
 *
 * When the 'companyContact' object is present, then we know this is the edit journey.
 *
 * @private
 */
function _formatDataForJourney(companyContact) {
  const { abstractionAlerts, company, contact } = companyContact

  return {
    abstractionAlerts: abstractionAlerts === true ? 'yes' : 'no',
    company,
    companyContact,
    email: contact.email,
    name: contact.$name()
  }
}

module.exports = {
  go
}
