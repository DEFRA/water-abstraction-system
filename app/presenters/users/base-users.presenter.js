'use strict'

/**
 * Determines part of the service a user should be returned to when clicking the 'Go back' link on external user pages
 *
 * @param {string} requestedQueryValue - The existing back query string value
 * @param {boolean} canManageAccounts - Whether the user can manage accounts
 *
 * @returns {object} The query string to use
 */
function sourceNavigation(requestedQueryValue, canManageAccounts) {
  if (!canManageAccounts || requestedQueryValue === 'search') {
    return {
      activeNavBar: 'search',
      backLink: {
        href: '/',
        text: 'Go back to search'
      },
      backQueryString: '?back=search'
    }
  }

  return {
    activeNavBar: 'users',
    backLink: {
      href: '/system/users',
      text: 'Go back to users'
    },
    backQueryString: '?back=users'
  }
}

module.exports = {
  sourceNavigation
}
