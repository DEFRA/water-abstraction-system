'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/contact-type` page
 *
 * @module SubmitContactTypeService
 */

const ContactTypePresenter = require('../../../presenters/notices/setup/contact-type.presenter.js')
const ContactTypeValidator = require('../../../validators/notices/setup/contact-type.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/contact-type` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const _submittedData = {
    id: session.id,
    contactType: {
      ...payload
    }
  }

  const pageData = ContactTypePresenter.go(_submittedData)

  return {
    activeNavBar: 'manage',
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  const _contactType = {
    email: payload.email ?? null,
    name: payload.name ?? null,
    type: payload.type ?? null
  }

  session.contactType = _contactType
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
