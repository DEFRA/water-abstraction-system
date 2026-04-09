'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/existing-address` page
 *
 * @module SubmitExistingAddressService
 */

const ExistingAddressPresenter = require('../../../presenters/billing-accounts/setup/existing-address.presenter.js')
const ExistingAddressValidator = require('../../../validators/billing-accounts/setup/existing-address.validator.js')
const FetchCompanyAddressesService = require('./fetch-company-addresses.service.js')
const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

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
  const session = await FetchSessionDal.go(sessionId)
  const companyAddresses = await _fetchCompanyAddresses(session)

  const validationResult = _validate(payload, companyAddresses.company.name)

  if (!validationResult) {
    await _save(session, payload)

    return {
      redirectUrl: _redirectUrl(session)
    }
  }

  const pageData = _submissionData(session, payload, companyAddresses)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _fetchCompanyAddresses(session) {
  const newAccount = !!session.existingAccount && session.existingAccount !== 'new'
  const companyId = newAccount ? session.existingAccount : session.billingAccount.company.id

  const companyAddresses = await FetchCompanyAddressesService.go(companyId)

  return companyAddresses
}

function _redirectUrl(session) {
  if (session.checkPageVisited) {
    return `/system/billing-accounts/setup/${session.id}/check`
  }

  return `/system/billing-accounts/setup/${session.id}/fao`
}

async function _save(session, payload) {
  if (session.addressSelected && session.addressSelected !== payload.addressSelected) {
    session.addressJourney = null
    session.checkPageVisited = false
    session.contactName = null
    session.contactSelected = null
    session.fao = null
  }

  session.addressSelected = payload.addressSelected

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
