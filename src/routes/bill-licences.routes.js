/**
 * Routes for the /bill-licences endpoints
 *
 * @module BillLicencesRoutes
 */

import { remove, submitRemove, view } from '../controllers/bill-licences.controller.js'

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: view
    },
    path: '/bill-licences/{id}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: remove
    },
    path: '/bill-licences/{id}/remove'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitRemove
    },
    path: '/bill-licences/{id}/remove'
  }
]
