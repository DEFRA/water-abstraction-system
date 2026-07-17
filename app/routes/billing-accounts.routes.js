import { changeAddress, view } from '../controllers/billing-accounts.controller.js'

export default [
  {
    method: 'GET',
    path: '/billing-accounts/{id}',
    options: {
      handler: view,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/billing-accounts/{billingAccountId}/change-address',
    options: {
      handler: changeAddress,
      app: {
        plainOutput: true
      },
      auth: {
        access: {
          scope: ['manage_billing_accounts']
        }
      },
      plugins: {
        crumb: false
      }
    }
  }
]
