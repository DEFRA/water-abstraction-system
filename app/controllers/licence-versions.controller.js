/**
 * Controller for /licences-versions endpoints
 * @module LicenceVersionsController
 */

import ViewService from '../services/licence-versions/view.service.js'

export async function view(request, h) {
  const {
    auth,
    params: { id }
  } = request

  const pageData = await ViewService(id, auth)

  return h.view(`licence-versions/view.njk`, pageData)
}
