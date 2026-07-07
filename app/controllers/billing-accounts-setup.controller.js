/**
 * Controller for /billing-accounts/setup endpoints
 * @module BillingAccountsSetupController
 */

import InitiateSessionService from '../services/billing-accounts/setup/initiate-session.service.js'
import SubmitAccountService from '../services/billing-accounts/setup/submit-account.service.js'
import SubmitAccountTypeService from '../services/billing-accounts/setup/submit-account-type.service.js'
import SubmitCheckService from '../services/billing-accounts/setup/submit-check.service.js'
import SubmitCompanySearchService from '../services/billing-accounts/setup/submit-company-search.service.js'
import SubmitContactService from '../services/billing-accounts/setup/submit-contact.service.js'
import SubmitContactNameService from '../services/billing-accounts/setup/submit-contact-name.service.js'
import SubmitExistingAccountService from '../services/billing-accounts/setup/submit-existing-account.service.js'
import SubmitExistingAddressService from '../services/billing-accounts/setup/submit-existing-address.service.js'
import SubmitFAOService from '../services/billing-accounts/setup/submit-fao.service.js'
import SubmitSelectCompanyService from '../services/billing-accounts/setup/submit-select-company.service.js'
import ViewAccountService from '../services/billing-accounts/setup/view-account.service.js'
import ViewAccountTypeService from '../services/billing-accounts/setup/view-account-type.service.js'
import ViewCheckService from '../services/billing-accounts/setup/view-check.service.js'
import ViewCompanySearchService from '../services/billing-accounts/setup/view-company-search.service.js'
import ViewContactService from '../services/billing-accounts/setup/view-contact.service.js'
import ViewContactNameService from '../services/billing-accounts/setup/view-contact-name.service.js'
import ViewExistingAddressService from '../services/billing-accounts/setup/view-existing-address.service.js'
import ViewExistingAccountService from '../services/billing-accounts/setup/view-existing-account.service.js'
import ViewFAOService from '../services/billing-accounts/setup/view-fao.service.js'
import ViewSelectCompanyService from '../services/billing-accounts/setup/view-select-company.service.js'

async function setup(request, h) {
  const { billingAccountId } = request.params

  const session = await InitiateSessionService.go(billingAccountId)

  return h.redirect(`/system/billing-accounts/setup/${session.id}/account`)
}

async function submitAccount(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitAccountService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/account.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitAccountType(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitAccountTypeService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/account-type.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitCheck(request, h) {
  const {
    params: { sessionId }
  } = request

  const pageData = await SubmitCheckService.go(sessionId)

  return h.redirect(pageData.redirectUrl)
}

async function submitCompanySearch(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitCompanySearchService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/company-search.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitContact(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitContactService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/contact.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitContactName(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitContactNameService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/contact-name.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitExistingAccount(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitExistingAccountService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/existing-account.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitExistingAddress(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitExistingAddressService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/existing-address.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitFAO(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitFAOService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/fao.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function submitSelectCompany(request, h) {
  const {
    payload,
    params: { sessionId }
  } = request

  const pageData = await SubmitSelectCompanyService.go(sessionId, payload)

  if (pageData.error) {
    return h.view(`billing-accounts/setup/select-company.njk`, pageData)
  }

  return h.redirect(pageData.redirectUrl)
}

async function viewAccount(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewAccountService.go(sessionId)

  return h.view(`billing-accounts/setup/account.njk`, pageData)
}

async function viewAccountType(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewAccountTypeService.go(sessionId)

  return h.view(`billing-accounts/setup/account-type.njk`, pageData)
}

async function viewCheck(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewCheckService.go(sessionId)

  return h.view(`billing-accounts/setup/check.njk`, pageData)
}

async function viewCompanySearch(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewCompanySearchService.go(sessionId)

  return h.view(`billing-accounts/setup/company-search.njk`, pageData)
}

async function viewContact(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewContactService.go(sessionId)

  return h.view(`billing-accounts/setup/contact.njk`, pageData)
}

async function viewContactName(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewContactNameService.go(sessionId)

  return h.view(`billing-accounts/setup/contact-name.njk`, pageData)
}

async function viewExistingAccount(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewExistingAccountService.go(sessionId)

  return h.view(`billing-accounts/setup/existing-account.njk`, pageData)
}

async function viewExistingAddress(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewExistingAddressService.go(sessionId)

  return h.view(`billing-accounts/setup/existing-address.njk`, pageData)
}

async function viewFAO(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewFAOService.go(sessionId)

  return h.view(`billing-accounts/setup/fao.njk`, pageData)
}

async function viewSelectCompany(request, h) {
  const { sessionId } = request.params

  const pageData = await ViewSelectCompanyService.go(sessionId)

  return h.view(`billing-accounts/setup/select-company.njk`, pageData)
}

export default {
  setup,
  submitAccount,
  submitAccountType,
  submitCheck,
  submitCompanySearch,
  submitContact,
  submitContactName,
  submitExistingAccount,
  submitExistingAddress,
  submitFAO,
  submitSelectCompany,
  viewCheck,
  viewCompanySearch,
  viewContact,
  viewContactName,
  viewAccount,
  viewAccountType,
  viewExistingAccount,
  viewExistingAddress,
  viewFAO,
  viewSelectCompany
}
