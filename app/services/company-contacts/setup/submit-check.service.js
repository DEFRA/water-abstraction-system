'use strict'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @module SubmitCheckService
 */

const CreateCompanyContactService = require('./create-company-contact.service.js')
const SessionModel = require('../../../models/session.model.js')
const { flashNotification } = require('../../../lib/general.lib.js')

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @param {string} sessionId - the UUID of the session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const companyId = session.company.id

  const companyContact = _companyContact(session)

  await CreateCompanyContactService.go(companyId, companyContact)

  flashNotification(yar, 'Contact added', `${session.name} was added to this company`)

  return { redirectUrl: `/system/companies/${companyId}/contacts` }
}

function _companyContact(session) {
  return {
    name: session.name,
    email: session.email,
    abstractionAlerts: session.abstractionAlerts === 'yes'
  }
}

module.exports = {
  go
}
