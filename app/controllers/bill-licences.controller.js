/**
 * Controller for /bill-licences endpoints
 * @module BillLicencesController
 */

import Boom from '@hapi/boom'

import RemoveBillLicenceService from '../services/bill-licences/remove-bill-licence.service.js'
import SubmitRemoveBillLicenceService from '../services/bill-licences/submit-remove-bill-licence.service.js'
import ViewBillLicenceService from '../services/bill-licences/view-bill-licence.service.js'

export async function remove(request, h) {
  const { id } = request.params

  const pageData = await RemoveBillLicenceService.go(id)

  return h.view('bill-licences/remove.njk', pageData)
}

export async function submitRemove(request, h) {
  const { id } = request.params

  try {
    const redirectPath = await SubmitRemoveBillLicenceService.go(id, request.auth.credentials.user)

    return h.redirect(redirectPath)
  } catch (error) {
    return Boom.badImplementation(error.message)
  }
}

export async function view(request, h) {
  const { id } = request.params

  const pageData = await ViewBillLicenceService.go(id)

  const template = pageData.scheme === 'sroc' ? 'view-sroc.njk' : 'view-presroc.njk'

  return h.view(`bill-licences/${template}`, pageData)
}
