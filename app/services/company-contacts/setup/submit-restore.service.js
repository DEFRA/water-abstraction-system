'use strict'

/**
 * Orchestrates validating the data for the `` page
 *
 * @module SubmitRestoreService
 */

const SessionModel = require('../../../models/session.model.js')
const { flashNotification } = require('../../../lib/general.lib.js')
const UpdateCompanyContactService = require('./update-company-contact.service.js')

/**
 * Orchestrates validating the data for the `` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, yar, auth) {
  const session = await SessionModel.query().findById(sessionId)

  const { company } = session

  await _updateCompanyContact(session, auth)

  flashNotification(yar, 'Contact restored', `${session.name} was restored.`)

  // await SessionModel.query().delete().where('id', sessionId)

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
