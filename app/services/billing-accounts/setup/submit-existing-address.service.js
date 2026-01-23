'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/existing-address` page
 *
 * @module SubmitExistingAddressService
 */

const FetchExistingAddressesService = require('./fetch-existing-addresses.service.js')
const ExistingAddressPresenter = require('../../../presenters/billing-accounts/setup/existing-address.presenter.js')
const ExistingAddressValidator = require('../../../validators/billing-accounts/setup/existing-address.validator.js')
const SessionModel = require('../../../models/session.model.js')

const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/existing-address` page
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

  if (session.addressSelected === 'new') {
    session.addressJourney = {
      activeNavBar: 'manage',
      address: {},
      backLink: { href: `/system/billing-accounts/setup/${session.id}/existing-address`, text: 'Back' },
      pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
      redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
    }
  }

  return session.$update()
}

function _submissionData(session, payload, companyAddresses) {
  session.addressSelected = payload.addressSelected

  return ExistingAddressPresenter.go(session, companyAddresses)
}

function _validate(payload, name) {
  const validationResult = ExistingAddressValidator.go(payload, name)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
