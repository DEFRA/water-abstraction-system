'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/select-existing-address` page
 *
 * @module SubmitSelectExistingAddressService
 */

const FetchExistingAddressesService = require('./fetch-existing-addresses.service.js')
const SelectExistingAddressPresenter = require('../../../presenters/billing-accounts/setup/select-existing-address.presenter.js')
const SelectExistingAddressValidator = require('../../../validators/billing-accounts/setup/select-existing-address.validator.js')
const SessionModel = require('../../../models/session.model.js')

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/select-existing-address` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload, session.billingAccount.company.name)

  if (!validationResult) {
    await _save(session, payload)

    return {
      addressSelected: payload.addressSelected
    }
  }

  const companyAddresses = await FetchExistingAddressesService.go(session.billingAccount.company.id)
  const pageData = _submissionData(session, payload, companyAddresses)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.addressSelected = payload.addressSelected

  return session.$update()
}

function _submissionData(session, payload, companyAddresses) {
  session.addressSelected = payload.addressSelected

  return SelectExistingAddressPresenter.go(session, companyAddresses)
}

function _validate(payload, name) {
  const validationResult = SelectExistingAddressValidator.go(payload, name)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
