/**
 * Initiates the session record used for setting up an existing company contact
 * @module InitiateEditSessionService
 */

import CreateSessionDal from '../../../dal/create-session.dal.js'
import FetchCompanyContactDal from '../../../dal/company-contacts/setup/fetch-company-contact.dal.js'
import FetchCompanyLicencesDal from '../../../dal/company-contacts/fetch-company-licences.dal.js'
import { formatEmail } from '../../../presenters/base.presenter.js'

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

  return {
    abstractionAlertLicences,
    abstractionAlerts: _abstractionAlerts(companyContact, licences),
    company,
    companyContact,
    email: formatEmail(contact.email),
    licences,
    name: contact.$name()
  }
}

/**
 * Determines the resolved abstraction alert type based on the user's selection and the current active licences.
 * - 'yes' - The contact wants alerts for any licence (including future ones).
 * - 'some' - The contact wants alerts for specific licences. If all licences expire/end, this defaults to 'no'.
 *
 * @private
 */
function _abstractionAlerts(companyContact, licences) {
  const abstractionAlertType = companyContact.$abstractionAlertType()

  if (abstractionAlertType === 'some' && licences.length === 0) {
    return 'no'
  }

  return abstractionAlertType
}

export default {
  go
}
