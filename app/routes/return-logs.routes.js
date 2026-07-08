import { download, submitDetails, viewCommunications, viewDetails } from '../controllers/return-logs.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/return-logs/{id}/communications',
    options: {
      handler: viewCommunications
    }
  },
  {
    method: 'GET',
    path: '/return-logs/{id}/details',
    options: {
      handler: viewDetails
    }
  },
  {
    method: 'POST',
    path: '/return-logs/{id}/details',
    options: {
      handler: submitDetails
    }
  },
  {
    method: 'GET',
    path: '/return-logs/{id}/download',
    options: {
      handler: download
    }
  }
]

export default routes
