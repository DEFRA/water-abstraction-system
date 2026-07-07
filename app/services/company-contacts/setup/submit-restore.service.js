/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @module SubmitRestoreService
 */

import DeleteSessionDal from '../../../dal/delete-session.dal.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import UpdateCompanyContactDal from '../../../dal/company-contacts/setup/update-company-contact.dal.js'
import { flashNotification } from '../../../lib/general.lib.js'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, yar, auth) {
  const session = await FetchSessionDal.go(sessionId)

  await DeleteSessionDal.go(sessionId)

  await _updateCompanyContact(session, auth)

  const { company, name } = session

  flashNotification(yar, 'Contact restored', `${name} was restored.`)

  return {
    redirectUrl: `/system/companies/${company.id}/contacts`
  }
}

async function _updateCompanyContact(session, auth) {
  const companyContact = {
    id: session.matchingContact.id,
    abstractionAlerts: session.abstractionAlerts === 'yes',
    contactId: session.matchingContact.contact.id,
    email: session.email.toLowerCase(),
    name: session.name,
    updatedBy: auth.credentials.user.id
  }

  await UpdateCompanyContactDal.go(companyContact)
}

export default {
  go
}
