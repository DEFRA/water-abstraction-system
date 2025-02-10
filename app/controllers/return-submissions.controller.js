'use strict'

/**
 * Controller for /return-submissions endpoints
 * @module ReturnSubmissionsController
 */

const ViewReturnSubmissionService = require('../services/return-submissions/view-return-submission.service.js')

async function view(request, h) {
  const { monthIndex, returnSubmissionId } = request.params

  // monthIndex is passed in as a string so we need to convert it to a number
  const pageData = await ViewReturnSubmissionService.go(returnSubmissionId, parseInt(monthIndex, 10))

  return h.view('return-submissions/view.njk', pageData)
}

module.exports = {
  view
}
