/**
 * Routes for the /billing-accounts endpoints
 *
 * @module BillingAccountsRoutes
 */

import { changeAddress, view } from '../controllers/billing-accounts.controller.js'

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
    path: '/billing-accounts/{id}'
  },
  {
    method: 'POST',
    options: {
      app: {
        plainOutput: true
      },
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      handler: changeAddress,
      plugins: {
        crumb: false
      }
    },
    path: '/billing-accounts/{billingAccountId}/change-address'
  }
]
