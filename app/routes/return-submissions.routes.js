import { view } from '../controllers/return-submissions.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/return-submissions/{returnSubmissionId}/{yearMonth}',
    options: {
      handler: view
    }
  }
]

export default routes
