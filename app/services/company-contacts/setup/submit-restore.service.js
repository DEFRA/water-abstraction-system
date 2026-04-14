'use strict'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @module SubmitRestoreService
 */

const DeleteSessionDal = require('../../../dal/delete-session.dal.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const UpdateCompanyContactService = require('./update-company-contact.service.js')
const { flashNotification } = require('../../../lib/general.lib.js')

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

  await UpdateCompanyContactService.go(companyContact)
}

module.exports = {
  go
}
