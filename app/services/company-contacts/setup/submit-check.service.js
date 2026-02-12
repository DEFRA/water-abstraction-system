'use strict'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @module SubmitCheckService
 */

const CreateCompanyContactService = require('./create-company-contact.service.js')
const SessionModel = require('../../../models/session.model.js')
const UpdateCompanyContactService = require('./update-company-contact.service.js')
const { flashNotification } = require('../../../lib/general.lib.js')

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @param {string} sessionId - the UUID of the session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, yar, auth) {
  const session = await SessionModel.query().findById(sessionId)

  if (session.companyContact) {
    const companyContact = _updateCompanyContact(session, auth)

    await UpdateCompanyContactService.go(companyContact)

    flashNotification(yar, 'Updated', 'Contact details updated.')

    return { redirectUrl: `/system/company-contacts/${session.companyContact.id}` }
  } else {
    const companyContact = _createCompanyContact(session, auth)

    await CreateCompanyContactService.go(session.company.id, companyContact)

    flashNotification(yar, 'Contact added', `${session.name} was added to this company`)

    return { redirectUrl: `/system/companies/${session.company.id}/contacts` }
  }
}

function _abstractionAlerts(session) {
  return session.abstractionAlerts === 'yes'
}

function _createCompanyContact(session, auth) {
  return {
    createdBy: auth.credentials.user.id,
    abstractionAlerts: _abstractionAlerts(session),
    email: session.email,
    name: session.name
  }
}

function _updateCompanyContact(session, auth) {
  return {
    id: session.companyContact.id,
    abstractionAlerts: _abstractionAlerts(session),
    contactId: session.companyContact.contact.id,
    email: session.email,
    name: session.name,
    updatedBy: auth.credentials.user.id
  }
}

module.exports = {
  go
}
