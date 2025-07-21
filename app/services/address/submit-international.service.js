'use strict'

/**
 * Orchestrates validating the data for `address/{sessionId}/international` page
 *
 * @module SubmitInternationalService
 */

const InternationalPresenter = require('../../presenters/address/international.presenter.js')
const InternationalValidator = require('../../validators/address/international.validator.js')
const SessionModel = require('../../models/session.model.js')

/**
 * Orchestrates validating the data for `address/{sessionId}/international` page
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
      international: {
        ...payload
      }
    }
  }

  const pageData = InternationalPresenter.go(_submittedData)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.address.international = {}
  session.address.international.addressLine1 = payload.addressLine1
  session.address.international.addressLine2 = payload.addressLine2 ?? null
  session.address.international.addressLine3 = payload.addressLine3 ?? null
  session.address.international.addressLine4 = payload.addressLine4 ?? null
  session.address.international.country = payload.country
  session.address.international.postcode = payload.postcode ?? null

  return session.$update()
}

function _validate(payload) {
  const validation = InternationalValidator.go(payload)

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
