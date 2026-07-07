import ReportsController from '../controllers/reports.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/reports/invalid-addresses',
    options: {
      handler: ReportsController.invalidAddresses,
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
      }
    }
  }
]

export default routes
