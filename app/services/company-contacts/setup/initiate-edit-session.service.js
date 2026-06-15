'use strict'

/**
 * Initiates the session record used for setting up an existing company contact
 * @module InitiateEditSessionService
 */

const CreateSessionDal = require('../../../dal/create-session.dal.js')
const FetchCompanyContactDal = require('../../../dal/company-contacts/setup/fetch-company-contact.dal.js')
const FetchCompanyLicencesDal = require('../../../dal/company-contacts/fetch-company-licences.dal.js')
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

  const data = _formatDataForJourney(companyContact, licences)

  return CreateSessionDal.go(data)
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
function _formatDataForJourney(companyContact, licences) {
  const { abstractionAlertLicences, company, contact } = companyContact

  const abstractionAlerts = companyContact.$abstractionAlertType()

  return {
    abstractionAlertLicences,
    abstractionAlerts: licences.length > 0 ? abstractionAlerts : 'no',
    company,
    companyContact,
    email: formatEmail(contact.email),
    licences,
    name: contact.$name()
  }
}

module.exports = {
  go
}
