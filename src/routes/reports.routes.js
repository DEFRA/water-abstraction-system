/**
 * Routes for the /reports endpoints
 *
 * @module ReportsRoutes
 */

import { invalidAddresses } from '../controllers/reports.controller.js'

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: [
            'ar_approver',
            'billing',
            'bulk_return_notifications',
            'hof_notifications',
            'manage_accounts',
            'renewal_notifications',
            'returns'
          ]
        }
      },
      handler: invalidAddresses
    },
    path: '/reports/invalid-addresses'
  }
]
