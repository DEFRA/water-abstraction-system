import { view } from '../controllers/return-submissions.controller.js'

export default [
  {
    method: 'GET',
    path: '/return-submissions/{returnSubmissionId}/{yearMonth}',
    options: {
      handler: view
    }
  }
]
