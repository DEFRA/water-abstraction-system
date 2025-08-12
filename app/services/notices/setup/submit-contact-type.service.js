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
    await _save(session, payload)

    GeneralLib.flashNotification(yar, 'Updated', 'Additional recipient added')

    return {
      type: payload.type
    }
  }

  const submittedData = {
    id: session.id,
    contactType: payload?.type ?? null,
    name: payload?.name ?? null
  }

  const pageData = ContactTypePresenter.go(submittedData)

  return {
    activeNavBar: 'manage',
    error: validationResult,
    ...pageData
  }
}

function _createMD5Hash(email) {
  return crypto.createHash('md5').update(email).digest('hex')
}

async function _save(session, payload) {
  if (payload.type === 'email') {
    const email = payload.email.toLowerCase()

    const recipient = {
      contact_hash_id: _createMD5Hash(email),
      email,
      licence_refs: session.licenceRef
    }

    if (Array.isArray(session.additionalRecipients)) {
      session.additionalRecipients.push(recipient)
    } else {
      session.additionalRecipients = [recipient]
    }

    session.selectedRecipients = [...session.selectedRecipients, recipient.contact_hash_id]

    delete session.contactName
    delete session.contactType

    return session.$update()
  }

  session.contactName = payload.name
  session.contactType = payload.type

  return session.$update()
}

function _validate(payload) {
  const validation = ContactTypeValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const result = {
    errorList: []
  }

  validation.error.details.forEach((detail) => {
    result.errorList.push({
      href: `#${detail.context.key}`,
      text: detail.message
    })

    result[detail.context.key] = detail.message
  })

  return result
}

module.exports = {
  go
}
