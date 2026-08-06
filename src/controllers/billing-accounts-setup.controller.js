/**
 * Controller for /billing-accounts/setup endpoints
 * @module BillingAccountsSetupController
 */

import InitiateSessionService from '../services/billing-accounts/setup/initiate-session.service.js'
import SubmitAccountService from '../services/billing-accounts/setup/submit-account.service.js'
import SubmitAccountTypeService from '../services/billing-accounts/setup/submit-account-type.service.js'
import SubmitCheckService from '../services/billing-accounts/setup/submit-check.service.js'
import SubmitCompanySearchService from '../services/billing-accounts/setup/submit-company-search.service.js'
import SubmitContactNameService from '../services/billing-accounts/setup/submit-contact-name.service.js'
import SubmitContactService from '../services/billing-accounts/setup/submit-contact.service.js'
import SubmitExistingAccountService from '../services/billing-accounts/setup/submit-existing-account.service.js'
import SubmitExistingAddressService from '../services/billing-accounts/setup/submit-existing-address.service.js'
import SubmitFAOService from '../services/billing-accounts/setup/submit-fao.service.js'
import SubmitSelectCompanyService from '../services/billing-accounts/setup/submit-select-company.service.js'
import ViewAccountService from '../services/billing-accounts/setup/view-account.service.js'
import ViewAccountTypeService from '../services/billing-accounts/setup/view-account-type.service.js'
import ViewCheckService from '../services/billing-accounts/setup/view-check.service.js'
import ViewCompanySearchService from '../services/billing-accounts/setup/view-company-search.service.js'
import ViewContactNameService from '../services/billing-accounts/setup/view-contact-name.service.js'
import ViewContactService from '../services/billing-accounts/setup/view-contact.service.js'
import ViewExistingAccountService from '../services/billing-accounts/setup/view-existing-account.service.js'
import ViewExistingAddressService from '../services/billing-accounts/setup/view-existing-address.service.js'
import ViewFAOService from '../services/billing-accounts/setup/view-fao.service.js'
import ViewSelectCompanyService from '../services/billing-accounts/setup/view-select-company.service.js'

export async function setup(request, h) {
  const { billingAccountId } = request.params

  const session = await InitiateSessionService(billingAccountId)

  return h.redirect(`/system/billing-accounts/setup/${session.id}/account`)
}

export async function submitAccount(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitAccountService(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/account.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

export async function submitAccountType(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitAccountTypeService(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/account-type.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

export async function submitCheck(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await SubmitCheckService(sessionId)

  return h.redirect(pageData.redirectUrl)
}

export async function submitCompanySearch(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitCompanySearchService(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/company-search.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

export async function submitContact(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitContactService(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/contact.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

export async function submitContactName(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitContactNameService(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/contact-name.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

export async function submitExistingAccount(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitExistingAccountService(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/existing-account.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

export async function submitExistingAddress(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitExistingAddressService(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/existing-address.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

export async function submitFAO(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitFAOService(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/fao.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

export async function submitSelectCompany(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitSelectCompanyService(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/select-company.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

export async function viewAccount(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewAccountService(sessionId)

  return h.view(`billing-accounts/setup/account.njk`, pageData)
}

export async function viewAccountType(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewAccountTypeService(sessionId)

  return h.view(`billing-accounts/setup/account-type.njk`, pageData)
}

export async function viewCheck(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewCheckService(sessionId)

  return h.view(`billing-accounts/setup/check.njk`, pageData)
}

export async function viewCompanySearch(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewCompanySearchService(sessionId)

  return h.view(`billing-accounts/setup/company-search.njk`, pageData)
}

export async function viewContact(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewContactService(sessionId)

  return h.view(`billing-accounts/setup/contact.njk`, pageData)
}

export async function viewContactName(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewContactNameService(sessionId)

  return h.view(`billing-accounts/setup/contact-name.njk`, pageData)
}

export async function viewExistingAccount(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewExistingAccountService(sessionId)

  return h.view(`billing-accounts/setup/existing-account.njk`, pageData)
}

export async function viewExistingAddress(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewExistingAddressService(sessionId)

  return h.view(`billing-accounts/setup/existing-address.njk`, pageData)
}

export async function viewFAO(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewFAOService(sessionId)

  return h.view(`billing-accounts/setup/fao.njk`, pageData)
}

export async function viewSelectCompany(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewSelectCompanyService(sessionId)

  return h.view(`billing-accounts/setup/select-company.njk`, pageData)
}
