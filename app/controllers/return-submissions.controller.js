'use strict'

/**
 * Controller for /return-submissions endpoints
 * @module ReturnSubmissionsController
 */

const ViewReturnSubmissionService = require('../services/return-submissions/view-return-submission.service.js')

async function view(request, h) {
  const { yearMonth, returnSubmissionId } = request.params

  const pageData = await ViewReturnSubmissionService.go(returnSubmissionId, yearMonth)

  return h.view('return-submissions/view.njk', pageData)
}

module.exports = {
  view
}
