'use strict'

/**
 * Controller for /bills endpoints
 * @module BillsController
 */

const Boom = require('@hapi/boom')

const RemoveBillService = require('../services/bills/remove-bill.service.js')
const SubmitRemoveBillService = require('../services/bills/submit-remove-bill.service.js')
const ViewBillService = require('../services/bills/view-bill.service.js')

async function remove(request, h) {
  const { id } = request.params

  const pageData = await RemoveBillService.go(id)

  return h.view('bills/remove.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
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

  const view = _determineView(pageData)

  return h.view(view, {
    pageTitle: `Bill for ${pageData.accountName}`,
    activeNavBar: 'bill-runs',
    ...pageData
  })
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

module.exports = {
  remove,
  submitRemove,
  view
}
