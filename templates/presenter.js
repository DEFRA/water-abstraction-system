/**
 * Formats data for the '' page
 * @module __MODULE_NAME__
 */

/**
 * Formats data for the '' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
export default function (session) {
  return {
    backLink: {
      href: '',
      text: 'Back'
    },
    pageTitle: ''
  }
}
