import {
  cancel,
  index,
  send,
  submitCancel,
  submitIndex,
  submitSend,
  twoPartTariff,
  view
} from '../controllers/bill-runs.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/bill-runs',
    options: {
      handler: index,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs',
    options: {
      handler: submitIndex,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}',
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
    method: 'GET',
    path: '/bill-runs/{id}/cancel',
    options: {
      handler: cancel,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/{id}/cancel',
    options: {
      handler: submitCancel,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}/send',
    options: {
      handler: send,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/bill-runs/{id}/send',
    options: {
      handler: submitSend,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/bill-runs/{id}/two-part-tariff',
    options: {
      handler: twoPartTariff,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

export default routes
