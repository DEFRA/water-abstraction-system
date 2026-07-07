/**
 * Controller for /bills endpoints
 * @module BillsController
 */

import Boom from '@hapi/boom'

import RemoveBillService from '../services/bills/remove-bill.service.js'
import SubmitRemoveBillService from '../services/bills/submit-remove-bill.service.js'
import ViewBillService from '../services/bills/view-bill.service.js'

async function remove(request, h) {
  const { id } = request.params

  const pageData = await RemoveBillService.go(id)

  return h.view('bills/remove.njk', pageData)
}

async function submitRemove(request, h) {
  const { id } = request.params

  try {
    const redirectPath = await SubmitRemoveBillService.go(id, request.auth.credentials.user)

    return h.redirect(redirectPath)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

async function view(request, h) {
  const { id } = request.params

  const pageData = await ViewBillService.go(id)

  const template = _determineView(pageData)

  return h.view(template, pageData)
}

function _determineView(pageData) {
  if (pageData.billLicences) {
    return 'bills/view-multi-licence.njk'
  }

  if (pageData.scheme === 'sroc') {
    return 'bills/view-single-licence-sroc.njk'
  }

  return 'bills/view-single-licence-presroc.njk'
}

export {
  remove,
  submitRemove,
  view
}
export default {
  remove,
  submitRemove,
  view
}
