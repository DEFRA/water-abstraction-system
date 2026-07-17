/**
 * Controller for /return-submissions endpoints
 * @module ReturnSubmissionsController
 */

import ViewReturnSubmissionService from '../services/return-submissions/view-return-submission.service.js'

export async function view(request, h) {
  const { yearMonth, returnSubmissionId } = request.params

  const pageData = await ViewReturnSubmissionService(returnSubmissionId, yearMonth)

  return h.view('return-submissions/view.njk', pageData)
}
