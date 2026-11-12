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

export default [
  {
    method: 'GET',
    options: {
      handler: viewPostcode
    },
    path: '/address/{sessionId}/postcode'
  },
  {
    method: 'POST',
    options: {
      handler: submitPostcode
    },
    path: '/address/{sessionId}/postcode'
  },
  {
    method: 'GET',
    options: {
      handler: viewSelect
    },
    path: '/address/{sessionId}/select'
  },
  {
    method: 'POST',
    options: {
      handler: submitSelect
    },
    path: '/address/{sessionId}/select'
  },
  {
    method: 'GET',
    options: {
      handler: viewManual
    },
    path: '/address/{sessionId}/manual'
  },
  {
    method: 'POST',
    options: {
      handler: submitManual
    },
    path: '/address/{sessionId}/manual'
  },
  {
    method: 'GET',
    options: {
      handler: viewInternational
    },
    path: '/address/{sessionId}/international'
  },
  {
    method: 'POST',
    options: {
      handler: submitInternational
    },
    path: '/address/{sessionId}/international'
  }
]
