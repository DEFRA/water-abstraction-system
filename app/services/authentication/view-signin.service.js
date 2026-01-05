'use strict'

/**
 * Shows the `/signin` page
 *
 * @module ViewSigninService
 */

const SigninPresenter = require('../../presenters/authentication/signin.presenter.js')

/**
 * Shows the `/signin` page
 *
 * @param {string} sessionId
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go() {
  const pageData = SigninPresenter.go()

  return {
    ...pageData
  }
}

module.exports = {
  go
}
