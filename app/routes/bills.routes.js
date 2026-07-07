import BillsController from '../controllers/bills.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/bills/{id}',
    options: {
      handler: BillsController.view,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bills/{id}/remove',
    options: {
      handler: BillsController.remove,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bills/{id}/remove',
    options: {
      handler: BillsController.submitRemove,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

export default routes
