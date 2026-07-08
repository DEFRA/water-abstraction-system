/**
 * Controller for /return-versions endpoints
 * @module ReturnVersionsController
 */

import ViewService from '../services/return-versions/view.service.js'

export async function view(request, h) {
  const { id } = request.params
  const pageData = await ViewService.go(id)

  return h.view('return-versions/view.njk', pageData)
}
