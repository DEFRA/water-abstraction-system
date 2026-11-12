/**
 * Routes for the /bill-runs/setup endpoints
 *
 * @module BillRunsSetupRoutes
 */

import {
  check,
  noLicences,
  region,
  season,
  setup,
  submitCheck,
  submitRegion,
  submitSeason,
  submitType,
  submitYear,
  type,
  year
} from '../controllers/bill-runs-setup.controller.js'

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: check
    },
    path: '/bill-runs/setup/{sessionId}/check'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitCheck
    },
    path: '/bill-runs/setup/{sessionId}/check'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: noLicences
    },
    path: '/bill-runs/setup/{sessionId}/no-licences'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: region
    },
    path: '/bill-runs/setup/{sessionId}/region'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitRegion
    },
    path: '/bill-runs/setup/{sessionId}/region'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: season
    },
    path: '/bill-runs/setup/{sessionId}/season'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitSeason
    },
    path: '/bill-runs/setup/{sessionId}/season'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: setup
    },
    path: '/bill-runs/setup'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: type
    },
    path: '/bill-runs/setup/{sessionId}/type'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitType
    },
    path: '/bill-runs/setup/{sessionId}/type'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: year
    },
    path: '/bill-runs/setup/{sessionId}/year'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitYear
    },
    path: '/bill-runs/setup/{sessionId}/year'
  }
]
