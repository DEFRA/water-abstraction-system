'use strict'

/**
 * Initiates the session record used for setting up an existing company contact
 * @module InitiateEditSessionService
 */

const FetchCompanyContactDal = require('../../../dal/company-contacts/setup/fetch-company-contact.dal.js')
const FetchCompanyLicencesDal = require('../../../dal/company-contacts/fetch-company-licences.dal.js')
const SessionModel = require('../../../models/session.model.js')
const { formatEmail } = require('../../../presenters/base.presenter.js')

/**
 * Initiates the session record used for setting up an existing company contact
 *
 * @param {string} companyContactId - the UUID of the company contact
 *
 * @returns {Promise<module:SessionModel>} the newly created session record
 */
async function go(companyContactId) {
  const companyContact = await FetchCompanyContactDal.go(companyContactId)

  const licences = await FetchCompanyLicencesDal.go(companyContact.company.id)

  return SessionModel.query()
    .insert({
      data: {
        ..._formatDataForJourney(companyContact),
        licences
      }
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
  const { abstractionAlertLicences, abstractionAlerts, company, contact } = companyContact

  return {
    abstractionAlertLicences,
    abstractionAlerts: _abstractionAlerts(abstractionAlerts, abstractionAlertLicences),
    company,
    companyContact,
    email: formatEmail(contact.email),
    name: contact.$name()
  }
}

/**
 * Determines the abstraction alerts value for the session
 *
 * Maps the boolean `abstractionAlerts` flag from the company contact record to the string value used in the journey.
 * If the contact has alerts enabled and abstraction alert licences linked, they receive alerts for some licences only.
 * If no licences are linked, they receive alerts for all licences.
 *
 * @returns {string} 'yes', 'some', or 'no'
 *
 * @private
 */
function _abstractionAlerts(abstractionAlerts, abstractionAlertLicences) {
  if (!abstractionAlerts) {
    return 'no'
  }

  return abstractionAlertLicences ? 'some' : 'yes'
}

module.exports = {
  go
}
