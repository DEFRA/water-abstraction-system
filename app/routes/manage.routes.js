'use strict'

const ManageController = require('../controllers/manage.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/manage',
    options: {
      handler: ManageController.view,
      auth: {
        access: {
          scope: [
            'returns',
            'bulk_return_notifications',
            'ar_approver',
            'hof_notifications',
            'renewal_notifications',
            'manage_accounts',
            'billing'
          ]
        }
      }
    }
  }
]

module.exports = routes
