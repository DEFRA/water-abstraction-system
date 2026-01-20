'use strict'

/**
 * Formats data for the '/customers-contacts/{id}/manage' page
 * @module ViewManagePresenter
 */

/**
 * Formats data for the '/customers-contacts/{id}/manage' page
 *
 * @returns {object} The data formatted for the view template
 */
function go() {
  return {
    backLink: {
      href: `/system/search`,
      text: 'Back'
    },
    pageTitle: 'Manage contact settings for'
  }
}

module.exports = {
  go
}
