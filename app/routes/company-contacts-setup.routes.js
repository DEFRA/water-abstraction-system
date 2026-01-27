'use strict'

const CompanyContactsSetupController = require('../controllers/company-contacts-setup.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/company-contacts/setup/{companyId}',
    options: {
      handler: CompanyContactsSetupController.setup,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  }
]

module.exports = routes
