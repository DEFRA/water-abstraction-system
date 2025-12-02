'use strict'

/**
 * Formats data for the `/licence-versions/{id}` page
 * @module ViewPresenter
 */

/**
 * Formats data for the `/licence-versions/{id}` page
 *
 * @returns {object} - The data formatted for the view template
 */
function go() {
  return {
    backLink: {
      href: '',
      text: 'Back'
    },
    pageTitle: 'Licence version starting',
    pageTitleCaption: 'Licence'
  }
}

module.exports = {
  go
}
