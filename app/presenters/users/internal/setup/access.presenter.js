/**
 * Formats data for the '/users/internal/setup/{sessionId}/access' page
 * @module AccessPresenter
 */

/**
 * Formats data for the '/users/internal/setup/{sessionId}/access' page
 *
 * @param {object} session - The session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { access, id: sessionId } = session

  return {
    access,
    activeNavBar: 'users',
    backLink: {
      href: `/system/users/internal/setup/${sessionId}/check`,
      text: 'Back'
    },
    pageTitle: 'Select access for the user',
    pageTitleCaption: 'Internal'
  }
}

export { go }
export default {
  go
}
