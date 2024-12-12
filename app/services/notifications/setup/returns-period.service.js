'use strict'

/**
 * Formats data for the `/notifications/setup/returns-period` page
 * @module ReturnsPeriodService
 */

const NotificationsPresenter = require('../../../presenters/notifications/setup/returns-period.presenter.js')

/**
 * Formats data for the `/notifications/setup/returns-period` page
 *
 *
 * @returns {object} The view data for the returns period page
 */
function go() {
  const formattedData = NotificationsPresenter.go()

  return {
    activeNavBar: 'manage',
    pageTitle: 'Select the returns periods for the invitations',
    ...formattedData
  }
}

module.exports = {
  go
}
