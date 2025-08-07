'use strict'

/**
 * Orchestrates validating the data for `address/{sessionId}/manual` page
 *
 * @module SubmitManualService
 */

const ManualAddressPresenter = require('../../presenters/address/manual.presenter.js')
const ManualAddressValidator = require('../../validators/address/manual.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `address/{sessionId}/manual` page
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
    address: {
      ...payload
    }
  }

  const pageData = ManualAddressPresenter.go(_submittedData)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.address.addressLine1 = payload.addressLine1
  session.address.addressLine2 = payload.addressLine2 ?? null
  session.address.addressLine3 = payload.addressLine3 ?? null
  session.address.addressLine4 = payload.addressLine4 ?? null
  session.address.postcode = payload.postcode

  return session.$update()
}

function _validate(payload) {
  const validation = ManualAddressValidator.go(payload)

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
