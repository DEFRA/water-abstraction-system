'use strict'

/**
 * Controller for /bill-licences endpoints
 * @module BillLicencesController
 */

const Boom = require('@hapi/boom')

const RemoveBillLicenceService = require('../services/bill-licences/remove-bill-licence.service.js')
const SubmitRemoveBillLicenceService = require('../services/bill-licences/submit-remove-bill-licence.service.js')
const ViewBillLicenceService = require('../services/bill-licences/view-bill-licence.service.js')

async function remove(request, h) {
  const { id } = request.params

  const pageData = await RemoveBillLicenceService.go(id)

  return h.view('bill-licences/remove.njk', {
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

async function submitRemove(request, h) {
  const { id } = request.params

  try {
    const redirectPath = await SubmitRemoveBillLicenceService.go(id, request.auth.credentials.user)

    return h.redirect(redirectPath)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

async function view(request, h) {
  const { id } = request.params

  const pageData = await ViewBillLicenceService.go(id)

  const view = pageData.scheme === 'sroc' ? 'view-sroc.njk' : 'view-presroc.njk'

  return h.view(`bill-licences/${view}`, {
    pageTitle: `Transactions for ${pageData.licenceRef}`,
    activeNavBar: 'bill-runs',
    ...pageData
  })
}

module.exports = {
  remove,
  submitRemove,
  view
}
