'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @module SubmitFAOService
 */

const FAOPresenter = require('../../../presenters/billing-accounts/setup/fao.presenter.js')
const FAOValidator = require('../../../validators/billing-accounts/setup/fao.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {
      redirectUrl: _redirectUrl(session)
    }
  }

  const pageData = FAOPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

function _redirectUrl(session) {
  if (!session.checkPageVisited && session.fao === 'yes') {
    return `/system/billing-accounts/setup/${session.id}/contact`
  }

  if (session.addressSelected === 'new') {
    return `/system/address/${session.id}/postcode`
  }

  return `/system/billing-accounts/setup/${session.id}/check`
}

async function _save(session, payload) {
  if (session.fao && payload.fao !== session.fao) {
    session.addressJourney = null
    session.checkPageVisited = false
    session.contactName = null
    session.contactSelected = null
  }

  if (!session.addressJourney && session.addressSelected === 'new' && payload.fao === 'no') {
    session.addressJourney = {
      address: {},
      backLink: { href: `/system/billing-accounts/setup/${session.id}/fao`, text: 'Back' },
      pageTitleCaption: `Billing account ${session.billingAccount.accountNumber}`,
      redirectUrl: `/system/billing-accounts/setup/${session.id}/check`
    }
  }

  session.fao = payload.fao

  return session.$update()
}

function _validate(payload) {
  const validationResult = FAOValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
