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
  },
  {
    method: 'GET',
    path: '/company-contacts/setup/{sessionId}/contact-email',
    options: {
      handler: CompanyContactsSetupController.viewContactEmail,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/company-contacts/setup/{sessionId}/contact-email',
    options: {
      handler: CompanyContactsSetupController.submitContactEmail,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/setup/{sessionId}/contact-name',
    options: {
      handler: CompanyContactsSetupController.viewContactName,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/company-contacts/setup/{sessionId}/contact-name',
    options: {
      handler: CompanyContactsSetupController.submitContactName,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  }
]

module.exports = routes
