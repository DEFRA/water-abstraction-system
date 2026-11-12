/**
 * Routes for the /company-contacts endpoints
 *
 * @module CompanyContactsRoutes
 */

import {
  submitRemoveCompanyContact,
  viewCommunications,
  viewContactDetails,
  viewRemoveCompanyContact
} from '../controllers/company-contacts.controller.js'

export default [
  {
    method: 'GET',
    options: {
      handler: viewCommunications
    },
    path: '/company-contacts/{id}/communications'
  },
  {
    method: 'GET',
    options: {
      handler: viewContactDetails
    },
    path: '/company-contacts/{id}/contact-details'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: viewRemoveCompanyContact
    },
    path: '/company-contacts/{id}/remove'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      },
      handler: submitRemoveCompanyContact
    },
    path: '/company-contacts/{id}/remove'
  }
]
