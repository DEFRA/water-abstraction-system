'use strict'

const ReturnsPeriodService = require('../services/notifications/setup/returns-period.service.js')

/**
 * Controller for /notifications/setup endpoints
 * @module NotificationsSetupController
 */

const basePath = 'notifications/setup'

async function viewReturnsPeriod(_request, h) {
  const pageDate = ReturnsPeriodService.go()

  return h.view(`${basePath}/view-returns-period.njk`, {
    ...pageDate
  })
}

module.exports = {
  viewReturnsPeriod
}
