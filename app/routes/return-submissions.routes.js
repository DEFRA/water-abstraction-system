import ReturnSubmissionsController from '../controllers/return-submissions.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/return-submissions/{returnSubmissionId}/{yearMonth}',
    options: {
      handler: ReturnSubmissionsController.view
    }
  }
]

export default routes
