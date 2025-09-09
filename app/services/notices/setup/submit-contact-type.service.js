'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/contact-type` page
 *
 * @module SubmitContactTypeService
 */

const crypto = require('crypto')

const ContactTypePresenter = require('../../../presenters/notices/setup/contact-type.presenter.js')
const ContactTypeValidator = require('../../../validators/notices/setup/contact-type.validator.js')
const GeneralLib = require('../../../lib/general.lib.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/contact-type` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload, yar) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload, yar)

    return {
      type: payload.type
    }
  }

  session.contactType = payload?.type ?? null
  session.name = payload?.name ?? null

  const pageData = ContactTypePresenter.go(session)

  return {
    activeNavBar: 'manage',
    error: validationResult,
    ...pageData
  }
}

/**
 * This logic is implemented as a function to illustrate the additional data required for the download link.
 *
 * We set the 'contact_type' to 'Single use'. This will be shown in the download for the recipient. This does not
 * affect the contact type used to send the notice. This is because the 'DetermineRecipientsService' sets the
 * default 'contact_type' to 'Returns to' when prior conditions are not met.
 *
 * We set the 'licence_ref' the same as the 'licence_refs' to allow the download to render each recipient (it fetches
 * all possible recipients without deduping).
 *
 * @private
 */
function _addDownloadRecipientData(licenceRef) {
  return {
    contact_type: 'Single use',
    licence_ref: licenceRef
  }
}

function _createMD5Hash(email) {
  return crypto.createHash('md5').update(email).digest('hex')
}

async function _save(session, payload, yar) {
  if (payload.type === 'email') {
    const email = payload.email.toLowerCase()

    const recipient = {
      contact_hash_id: _createMD5Hash(email),
      email,
      licence_refs: session.licenceRef,
      ..._addDownloadRecipientData(session.licenceRef)
    }

    if (Array.isArray(session.additionalRecipients)) {
      session.additionalRecipients.push(recipient)
    } else {
      session.additionalRecipients = [recipient]
    }

    session.selectedRecipients = [...session.selectedRecipients, recipient.contact_hash_id]

    delete session.contactName
    delete session.contactType

    GeneralLib.flashNotification(yar, 'Updated', 'Additional recipient added')

    return session.$update()
  }

  session.contactName = payload.name
  session.contactType = payload.type

  return session.$update()
}

function _validate(payload) {
  const validationResult = ContactTypeValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
