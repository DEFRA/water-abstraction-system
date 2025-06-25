'use strict'

const AddressController = require('../controllers/address.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/address/{sessionId}/postcode',
    options: {
      handler: AddressController.postcode,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/address/{sessionId}/postcode',
    options: {
      handler: AddressController.submitPostcode,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/address/{sessionId}/select',
    options: {
      handler: AddressController.viewSelect,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/address/{sessionId}/select',
    options: {
      handler: AddressController.submitSelect,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
