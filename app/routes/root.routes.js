import RootController from '../controllers/root.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: RootController.index,
    options: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/status',
    handler: RootController.index,
    options: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/hello-world',
    handler: RootController.helloWorld,
    options: {
      auth: false
    }
  },
  {
    method: 'GET',
    path: '/service-status',
    handler: RootController.serviceStatus,
    options: {
      auth: false
    }
  }
]

export default routes
