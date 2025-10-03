'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/standard` page
 * @module StandardPresenter
 */

/**
 * Formats data for the `/notices/setup/{sessionId}/standard` page
 *
 * @returns {object} - The data formatted for the view template
 */
function go() {
  return {
    backLink: {
      href: '/system/notices',
      text: 'Back'
    },
    pageTitle: 'Select a notice type',
    radioOptions: [
      {
        value: 'invitations',
        text: 'Invitations'
      },
      {
        value: 'reminders',
        text: 'Reminders'
      }
    ]
  }
}

module.exports = {
  go
}
