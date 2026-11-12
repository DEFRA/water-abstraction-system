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

export default [
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: index
    },
    path: '/bill-runs'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitIndex
    },
    path: '/bill-runs'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: view
    },
    path: '/bill-runs/{id}'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: cancel
    },
    path: '/bill-runs/{id}/cancel'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitCancel
    },
    path: '/bill-runs/{id}/cancel'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: send
    },
    path: '/bill-runs/{id}/send'
  },
  {
    method: 'POST',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: submitSend
    },
    path: '/bill-runs/{id}/send'
  },
  {
    method: 'GET',
    options: {
      auth: {
        access: {
          scope: ['billing']
        }
      },
      handler: twoPartTariff
    },
    path: '/bill-runs/{id}/two-part-tariff'
  }
]
