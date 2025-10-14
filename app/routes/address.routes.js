'use strict'

const AddressController = require('../controllers/address.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/address/{sessionId}/postcode',
    options: {
      handler: AddressController.viewPostcode
    }
  },
  {
    method: 'POST',
    path: '/address/{sessionId}/postcode',
    options: {
      handler: AddressController.submitPostcode
    }
  },
  {
    method: 'GET',
    path: '/address/{sessionId}/select',
    options: {
      handler: AddressController.viewSelect
    }
  },
  {
    method: 'POST',
    path: '/address/{sessionId}/select',
    options: {
      handler: AddressController.submitSelect
    }
  },
  {
    method: 'GET',
    path: '/address/{sessionId}/manual',
    options: {
      handler: AddressController.viewManual
    }
  },
  {
    method: 'POST',
    path: '/address/{sessionId}/manual',
    options: {
      handler: AddressController.submitManual
    }
  },
  {
    method: 'GET',
    path: '/address/{sessionId}/international',
    options: {
      handler: AddressController.viewInternational
    }
  },
  {
    method: 'POST',
    path: '/address/{sessionId}/international',
    options: {
      handler: AddressController.submitInternational
    }
  }
]

module.exports = routes
