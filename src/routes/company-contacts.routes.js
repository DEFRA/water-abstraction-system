import {
  submitRemoveCompanyContact,
  viewCommunications,
  viewContactDetails,
  viewRemoveCompanyContact
} from '../controllers/company-contacts.controller.js'

export default [
  {
    method: 'GET',
    path: '/company-contacts/{id}/communications',
    options: {
      handler: viewCommunications
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/{id}/contact-details',
    options: {
      handler: viewContactDetails
    }
  },
  {
    method: 'GET',
    path: '/company-contacts/{id}/remove',
    options: {
      handler: viewRemoveCompanyContact,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/company-contacts/{id}/remove',
    options: {
      handler: submitRemoveCompanyContact,
      auth: {
        access: {
          scope: ['hof_notifications']
        }
      }
    }
  }
]
