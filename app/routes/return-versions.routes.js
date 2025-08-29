'use strict'

const ReturnVersionsController = require('../controllers/return-versions.controller.js')

const featureFlagsConfig = require('../../config/feature-flags.config.js')

const routes = [
  {
    method: 'GET',
    path: '/return-versions/{id}',
    options: {
      handler: ReturnVersionsController.view,
      ...(!featureFlagsConfig.enableLicenceVersions
        ? {
            auth: {
              access: {
                scope: ['view_charge_versions']
              }
            }
          }
        : {})
    }
  }
]

module.exports = routes
