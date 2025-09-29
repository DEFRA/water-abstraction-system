'use strict'

/**
 * Provides the display information for the `/manage` page
 *
 * @module ViewManageService
 */

const ManagePresenter = require('../../presenters/manage/manage.presenter.js')

/**
 * Provides the display information for the `/manage` page
 *
 * The items displayed on the page are determined by the user's authentication scopes and the current feature flag
 * settings.
 *
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The view data for the Manage page
 */
async function go(auth) {
  const pageData = ManagePresenter.go(auth.credentials.scope)

  return {
    activeNavBar: 'manage',
    ...pageData
  }
}

module.exports = {
  go
}
