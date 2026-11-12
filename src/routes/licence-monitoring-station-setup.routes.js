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
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: submitSetup
    },
    path: '/licence-monitoring-station/setup'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: thresholdAndUnit
    },
    path: '/licence-monitoring-station/setup/{sessionId}/threshold-and-unit'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: submitThresholdAndUnit
    },
    path: '/licence-monitoring-station/setup/{sessionId}/threshold-and-unit'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: stopOrReduce
    },
    path: '/licence-monitoring-station/setup/{sessionId}/stop-or-reduce'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: submitStopOrReduce
    },
    path: '/licence-monitoring-station/setup/{sessionId}/stop-or-reduce'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: licenceNumber
    },
    path: '/licence-monitoring-station/setup/{sessionId}/licence-number'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: submitLicenceNumber
    },
    path: '/licence-monitoring-station/setup/{sessionId}/licence-number'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: fullCondition
    },
    path: '/licence-monitoring-station/setup/{sessionId}/full-condition'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: submitFullCondition
    },
    path: '/licence-monitoring-station/setup/{sessionId}/full-condition'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: abstractionPeriod
    },
    path: '/licence-monitoring-station/setup/{sessionId}/abstraction-period'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: submitAbstractionPeriod
    },
    path: '/licence-monitoring-station/setup/{sessionId}/abstraction-period'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: check
    },
    path: '/licence-monitoring-station/setup/{sessionId}/check'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['manage_gauging_station_licence_links']
        }
      },
      handler: submitCheck
    },
    path: '/licence-monitoring-station/setup/{sessionId}/check'
  }
]
