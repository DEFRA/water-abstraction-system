import {
  submitInternational,
  submitManual,
  submitPostcode,
  submitSelect,
  viewInternational,
  viewManual,
  viewPostcode,
  viewSelect
} from '../controllers/address.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/address/{sessionId}/postcode',
    options: {
      handler: viewPostcode
    }
  },
  {
    method: 'POST',
    path: '/address/{sessionId}/postcode',
    options: {
      handler: submitPostcode
    }
  },
  {
    method: 'GET',
    path: '/address/{sessionId}/select',
    options: {
      handler: viewSelect
    }
  },
  {
    method: 'POST',
    path: '/address/{sessionId}/select',
    options: {
      handler: submitSelect
    }
  },
  {
    method: 'GET',
    path: '/address/{sessionId}/manual',
    options: {
      handler: viewManual
    }
  },
  {
    method: 'POST',
    path: '/address/{sessionId}/manual',
    options: {
      handler: submitManual
    }
  },
  {
    method: 'GET',
    path: '/address/{sessionId}/international',
    options: {
      handler: viewInternational
    }
  },
  {
    method: 'POST',
    path: '/address/{sessionId}/international',
    options: {
      handler: submitInternational
    }
  }
]

export default routes
