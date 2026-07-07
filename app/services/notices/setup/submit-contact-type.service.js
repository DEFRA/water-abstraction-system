/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/contact-type` page
 *
 * @module SubmitContactTypeService
 */

import crypto from 'node:crypto'

import ContactTypePresenter from '../../../presenters/notices/setup/contact-type.presenter.js'
import ContactTypeValidator from '../../../validators/notices/setup/contact-type.validator.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'
import { flashNotification } from '../../../lib/general.lib.js'

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
  const session = await FetchSessionDal.go(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload, yar)

    return {
      contactType: payload.contactType
    }
  }

  session.contactType = payload?.contactType ?? null
  session.contactName = payload?.contactName ?? null

  const pageData = ContactTypePresenter.go(session)

  return {
    activeNavBar: 'notices',
    error: validationResult,
    ...pageData
  }
}

function _addRecipient(session, payload) {
  const email = payload.contactEmail.toLowerCase()

  const additionalRecipient = {
    contact: null,
    contact_hash_id: _contactHashId(email),
    contact_type: 'single use',
    email,
    licence_ref: session.licenceRef,
    licence_refs: [session.licenceRef],
    message_type: 'Email'
  }

  if (session.additionalRecipients) {
    session.additionalRecipients.push(additionalRecipient)
  } else {
    session.additionalRecipients = [additionalRecipient]
  }

  session.selectedRecipients.push(additionalRecipient.contact_hash_id)
}

function _contactHashId(email) {
  return crypto.createHash('md5').update(email).digest('hex')
}

async function _save(session, payload, yar) {
  if (payload.contactType === 'email') {
    _addRecipient(session, payload)

    flashNotification(yar, 'Updated', 'Additional recipient added')
  } else {
    session.contactName = payload.contactName
    session.contactType = payload.contactType
  }

  await session.$update()
}

function _validate(payload) {
  const validationResult = ContactTypeValidator.go(payload)

  return formatValidationResult(validationResult)
}

export {
  go
}
export default {
  go
}
