/**
 * Controller for /manage endpoints
 * @module ManageController
 */

import ViewManageService from '../services/manage/view-manage.service.js'

async function view(request, h) {
  const { auth } = request
  const pageData = await ViewManageService.go(auth)

  return h.view('manage/manage.njk', pageData)
}

export {
  view
}
export default {
  view
}
