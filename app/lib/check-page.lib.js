'use strict'

/**
 * Check page helper methods
 * @module CheckPageLib
 */

/**
 * Checks if the '/check' page of a journey has been visited and returns the appropriate url
 *
 * If `session.checkPageVisited` is true, the last segment of the path is replaced with 'check'.
 *
 * For example, a url of '/setup/123/contact-email' becomes '/setup/123/check'.
 *
 * Our journeys have to support users working through the journey once, but then being able to return to a page from the
 * '/check' page to edit the value. This method helps manage the back or redirect URLs for those pages.
 *
 * The 'Back' link is expected to return the user to the '/check' page if they have already visited it, else return them
 * to the previous page in the journey. The same applies when the user submits a page - they should be redirected back
 * to or the next page in the journey depending on whether they came from the '/check' page.
 *
 * @param {object} session - The session instance
 * @param {string} url - The url
 *
 * @returns {string} The url to use, modified to point to the '/check' page if it has been visited
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
