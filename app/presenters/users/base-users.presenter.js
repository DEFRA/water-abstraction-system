'use strict'

/**
 * Determines the navigation elements for external user pages, for example, `activeNavBar` and the back link
 *
 * Users can access external user pages from two sources: the **Search** and **Users** pages.
 *
 * They expect to be able to go back to where they came from, even if they move between the split pages for an external
 * user.
 *
 * So, when they click a link from one of these sources a query string is added to the URL, for example, `?back=search`.
 * The external user presenters pass this through to here, and it is used to determine
 *
 * - What navigation menu to highlight whilst the user is viewing the external user pages
 * - What text and link to use for the 'Go back to' link on the pages
 * - What query string to add to the side navigation links, so we retain where the users came from
 *
 * Though it is unlikely, a malicious user without permissions to access **Users**, could change the query param to
 * `?back=users` to force the service to display links to it.
 *
 * > They couldn't access the page even if we did because the page has its own permissions check
 *
 * Just in case, we also include a check as to whether the user even has access to **Users**. In the case they do not,
 * we _always_ return the 'Search' navigation details.
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
