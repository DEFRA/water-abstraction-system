'use strict'

/**
 * Checks if the check page has been visited and updates the backlink accordingly.
 * If session.checkPageVisited is true, the last segment of the path is replaced
 * with 'check'.
 *
 * For example, a backLink.href of '/setup/123/contact-email' becomes '/setup/123/check'.
 *
 * @param {object} session - The session instance
 * @param {object} backLink - the backlink object { href: string, text: string}
 *
 * @returns {object} The updated backlink, or provided backlink if no update is required.
 */
function checkBackLink(session, backLink) {
  const { checkPageVisited } = session

  if (checkPageVisited) {
    return {
      ...backLink,
      href: _updateUrlToCheck(backLink.href)
    }
  }

  return backLink
}

/**
 * Checks if the check page has been visited and updates the redirectUrl accordingly.
 * If session.checkPageVisited is true, the last segment of the path is replaced
 * with 'check'.
 *
 * For example, a redirectUrl of '/setup/123/contact-email' becomes '/setup/123/check'.
 *
 * @param {module:SessionModel} session - The session instance
 * @param {string} redirectUrl - The redirectUrl
 *
 * @returns {string} The updated redirectUrl, or provided redirectUrl if no update is required.
 */
function checkRedirectUrl(session, redirectUrl) {
  const { checkPageVisited } = session

  if (checkPageVisited) {
    return _updateUrlToCheck(redirectUrl)
  }

  return redirectUrl
}

/**
 * Sets a 'checkPageVisited' flag on the session to true.
 *
 * This flag is used to determine the redirect URL for a check page.
 *
 * @param {module:SessionModel} session - The session instance
 */
async function markCheckPageVisited(session) {
  session.checkPageVisited = true

  await session.$update()
}

function _updateUrlToCheck(url) {
  return url.replace(/\/[^/]*$/, '/check')
}

module.exports = {
  checkBackLink,
  checkRedirectUrl,
  markCheckPageVisited
}
