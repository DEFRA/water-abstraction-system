import { view } from '../controllers/manage.controller.js'

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
            'charge_version_workflow_editor',
            'charge_version_workflow_reviewer',
            'hof_notifications',
            'manage_accounts',
            'renewal_notifications',
            'returns'
          ]
        }
      },
      handler: view
    },
    path: '/manage'
  }
]
