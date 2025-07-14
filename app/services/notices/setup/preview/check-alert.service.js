'use strict'

/**
 * Orchestrates presenting the data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-alert` page
 *
 * @module CheckAlertService
 */

const CheckAlertPresenter = require('../../../../presenters/notices/setup/preview/check-alert.presenter.js')
const DetermineRecipientsService = require('../determine-recipients.service.js')
const FetchAbstractionAlertRecipientsService = require('../fetch-abstraction-alert-recipients.service.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates presenting the data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-alert` page
 *
 * @param {string} contactHashId - The recipients unique identifier
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(contactHashId, sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const recipientLicenceRefs = await _recipientLicenceRefs(contactHashId, session)

  const pageData = CheckAlertPresenter.go(contactHashId, recipientLicenceRefs, session)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}

async function _recipientLicenceRefs(contactHashId, session) {
  const recipientsData = await FetchAbstractionAlertRecipientsService.go(session)

  const recipients = DetermineRecipientsService.go(recipientsData)

  const recipient = recipients.find((recipient) => {
    return recipient.contact_hash_id === contactHashId
  })

  return recipient.licence_refs.split(',')
}

module.exports = {
  go
}
