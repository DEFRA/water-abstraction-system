'use strict'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @module SubmitCheckService
 */

const PersistCompanyContactService = require('./create-company-contact.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/check' page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const companyId = session.company.id

  const companyContact = _companyContact(session)

  await PersistCompanyContactService.go(companyId, companyContact)

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
