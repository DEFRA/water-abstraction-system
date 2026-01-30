'use strict'

/**
 * Check page helper methods
 * @module CheckPageLib
 */

/**
 * Checks if the check page has been visited and updates the url accordingly.
 * If session.checkPageVisited is true, the last segment of the path is replaced
 * with 'check'.
 *
 * For example, a url of '/setup/123/contact-email' becomes '/setup/123/check'.
 *
 * @param {object} session - The session instance
 * @param {string} url - The url
 *
 * @returns {string} The updated redirectUrl, or provided redirectUrl if no update is required.
 */
function checkUrl(session, url) {
  const { checkPageVisited } = session

  if (checkPageVisited) {
    return url.replace(/\/[^/]*$/, '/check')
  }

  return url
}

/**
 * Sets a 'checkPageVisited' flag on the session to false.
 *
 * This flag is used to determine the redirect URL for a check page.
 *
 * @param {object} session - The session instance
 */
async function markCheckPageNotVisited(session) {
  session.checkPageVisited = false

  await session.$update()
}

/**
 * Sets a 'checkPageVisited' flag on the session to true.
 *
 * This flag is used to determine the redirect URL for a check page.
 *
 * @param {object} session - The session instance
 */
async function markCheckPageVisited(session) {
  session.checkPageVisited = true

  await session.$update()
}

module.exports = {
  checkUrl,
  markCheckPageNotVisited,
  markCheckPageVisited
}
