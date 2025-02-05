'use strict'

/**
 * Controller for /return-submissions endpoints
 * @module ReturnSubmissionsController
 */

async function view(request, h) {
  const { monthIndex, returnSubmissionId } = request.params

  return h.view('return-submissions/view.njk', { monthIndex, returnSubmissionId })
}

module.exports = {
  view
}
