'use strict'

/**
 * Orchestrates presenting the data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-alert` page
 *
 * @module ViewPreviewCheckAlertService
 */

const CheckAlertPresenter = require('../../../../presenters/notices/setup/preview/preview-check-alert.presenter.js')
const FetchAbstractionAlertRecipientsDal = require('../../../../dal/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.dal.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')

/**
 * Orchestrates presenting the data for the `/notices/setup/{sessionId}/preview/{contactHashId}/check-alert` page
 *
 * @param {string} contactHashId - The recipients unique identifier
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(contactHashId, sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  const recipientLicenceRefs = await _recipientLicenceRefs(contactHashId, session)

  const pageData = CheckAlertPresenter.go(contactHashId, recipientLicenceRefs, session)

  return {
    activeNavBar: 'notices',
    ...pageData
  }
}

async function _recipientLicenceRefs(contactHashId, session) {
  const recipients = await FetchAbstractionAlertRecipientsDal.go(session)

  const matchedRecipient = recipients.find((recipient) => {
    return recipient.contact_hash_id === contactHashId
  })

  return matchedRecipient.licence_refs
}

module.exports = {
  go
}
