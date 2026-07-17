import {
  abstractionPeriod,
  check,
  fullCondition,
  licenceNumber,
  stopOrReduce,
  submitAbstractionPeriod,
  submitCheck,
  submitFullCondition,
  submitLicenceNumber,
  submitSetup,
  submitStopOrReduce,
  submitThresholdAndUnit,
  thresholdAndUnit
} from '../controllers/licence-monitoring-station-setup.controller.js'

export default [
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup',
    options: {
      handler: submitSetup,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licence-monitoring-station/setup/{sessionId}/threshold-and-unit',
    options: {
      handler: thresholdAndUnit,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup/{sessionId}/threshold-and-unit',
    options: {
      handler: submitThresholdAndUnit,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licence-monitoring-station/setup/{sessionId}/stop-or-reduce',
    options: {
      handler: stopOrReduce,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup/{sessionId}/stop-or-reduce',
    options: {
      handler: submitStopOrReduce,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licence-monitoring-station/setup/{sessionId}/licence-number',
    options: {
      handler: licenceNumber,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup/{sessionId}/licence-number',
    options: {
      handler: submitLicenceNumber,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licence-monitoring-station/setup/{sessionId}/full-condition',
    options: {
      handler: fullCondition,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup/{sessionId}/full-condition',
    options: {
      handler: submitFullCondition,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licence-monitoring-station/setup/{sessionId}/abstraction-period',
    options: {
      handler: abstractionPeriod,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup/{sessionId}/abstraction-period',
    options: {
      handler: submitAbstractionPeriod,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licence-monitoring-station/setup/{sessionId}/check',
    options: {
      handler: check,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licence-monitoring-station/setup/{sessionId}/check',
    options: {
      handler: submitCheck,
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      }
    }
  }
]
