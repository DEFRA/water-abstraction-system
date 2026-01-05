'use strict'

/**
 * Formats data for the `/signin` page
 * @module SigninPresenter
 */

/**
 * Formats data for the `/signin` page
 *
 * @param {object} payload - The submitted form data
 *
 * @returns {object} The data formatted for the view template
 */
function go(payload) {
  return {
    backLink: {
      href: '',
      text: 'Back'
    },
    pageTitle: '',
    username: payload?.username || ''
  }
}

module.exports = {
  go
}
