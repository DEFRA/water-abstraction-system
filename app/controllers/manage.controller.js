/**
 * Controller for /manage endpoints
 * @module ManageController
 */

import ViewManageService from '../services/manage/view-manage.service.js'

export async function view(request, h) {
  const { auth } = request
  const pageData = await ViewManageService(auth)

  return h.view('manage/manage.njk', pageData)
}
