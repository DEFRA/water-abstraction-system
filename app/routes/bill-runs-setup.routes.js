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

const routes = [
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/check',
    options: {
      handler: check,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/setup/{sessionId}/check',
    options: {
      handler: submitCheck,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/no-licences',
    options: {
      handler: noLicences,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/region',
    options: {
      handler: region,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/setup/{sessionId}/region',
    options: {
      handler: submitRegion,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/season',
    options: {
      handler: season,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/setup/{sessionId}/season',
    options: {
      handler: submitSeason,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/setup',
    options: {
      handler: setup,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/type',
    options: {
      handler: type,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/setup/{sessionId}/type',
    options: {
      handler: submitType,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/setup/{sessionId}/year',
    options: {
      handler: year,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/setup/{sessionId}/year',
    options: {
      handler: submitYear,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

export default routes
