'use strict'

const ReturnLogsSetupController = require('../controllers/return-logs-setup.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/return-logs/setup',
    options: {
      handler: ReturnLogsSetupController.setup,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/received',
    options: {
      handler: ReturnLogsSetupController.received,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/received',
    options: {
      handler: ReturnLogsSetupController.submitReceived,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/return-logs/setup/{sessionId}/reported',
    options: {
      handler: ReturnLogsSetupController.reported,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/return-logs/setup/{sessionId}/reported',
    options: {
      handler: ReturnLogsSetupController.submitReported,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
