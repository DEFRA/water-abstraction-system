'use strict'

/**
 * Provides the items for the `/manage` page.
 *
 * Each item is a link to a particular piece of management functionality, the access to which depends on the
 * authenticated user's defined security scopes.
 *
 * Some pieces of functionality are controlled by feature flags.
 *
 * The full set of user scopes that have access to some of the links is:
 *
 * 'ar_approver'
 * 'billing'
 * 'bulk_return_notifications'
 * 'charge_version_workflow_editor'
 * 'charge_version_workflow_reviewer'
 * 'hof_notifications'
 * 'manage_accounts'
 * 'renewal_notifications'
 * 'returns'
 *
 * But there is no consistent relationship between scopes and specific links or groups of links, so this service
 * holds the mapping between the scopes and the links.
 *
 * @module ViewManageService
 */

const config = require('../../../config/feature-flags.config.js')

/**
 * Provides a function that dynamically checks if a feature flag is enabled.
 *
 * These functions are used to ensure that the feature flags are checked at the time that the page is being displayed,
 * which allows them to be checked by our unit tests.
 *
 * @param {string} featureFlag - The name of the feature flag to be checked.
 * @returns {function(): boolean}
 */
function ifHasFeatureFlag(featureFlag) {
  return () => {
    return config[featureFlag]
  }
}

/**
 * Provides a function that dynamically checks if a feature flag is not enabled.
 *
 * These functions are used to ensure that the feature flags are checked at the time that the page is being displayed,
 * which allows them to be checked by our unit tests.
 *
 * @param {string} featureFlag - The name of the feature flag to be checked.
 * @returns {function(): boolean}
 */
function ifDoesNotHaveFeatureFlag(featureFlag) {
  return () => {
    return !config[featureFlag]
  }
}

/**
 * A default function to use in if the link on the page is not dependent on a feature flag.
 *
 * @returns {boolean} Always true
 */
function irrespectiveOfFeatureFlags() {
  return true
}

/**
 * Creates a link object for a specific item on the page.
 *
 * @param {string} name - The name of the link.
 * @param {string} path - The path of the link.
 * @param {string|Array<string>} scopeOrScopes - The scope(s) required to view the link.
 * @param {function(): boolean} featureFlagCheck - A function that checks if the relevant feature flag is enabled.
 * @returns {object} The link object.
 */
function createLink(name, path, scopeOrScopes, featureFlagCheck = irrespectiveOfFeatureFlags) {
  const scopes = Array.isArray(scopeOrScopes) ? scopeOrScopes : [scopeOrScopes]

  return { featureFlagCheck, name, path, scopes }
}

/**
 * The definition of all the links that can possibly be displayed on the page.
 *
 * The configuration is laid out to make the links on the page explicitly related to the user scopes and feature flags
 * that control whether or not they are displayed.
 *
 * That's why there's a `prettier-ignore` comment above this block, to ensure that the formatting remains consistent
 * for all the link definitions.
 *
 * @type {object}
 */
// prettier-ignore
const ALL_LINKS = {
  accounts: [
    createLink(
      'Create an internal account',
      '/account/create-user',
      'manage_accounts'
    )
  ],
  chargeInformationWorkflow: [
    createLink(
      'Check licences in workflow',
      '/charge-information-workflow',
      ['charge_version_workflow_editor', 'charge_version_workflow_reviewer']
    )
  ],
  hofNotifications: [
    createLink(
      'Restriction',
      'notifications/1?start=1',
      'hof_notifications'
    ),
    createLink(
      'Hands-off flow',
      'notifications/3?start=1',
      'hof_notifications'
    ),
    createLink(
      'Resume',
      'notifications/4?start=1',
      'hof_notifications'
    )
  ],
  licenceNotifications: [
    createLink(
      'Renewal',
      'notifications/2?start=1',
      'renewal_notifications'
    )
  ],
  reports: [
    createLink(
      'Notices',
      '/notifications/report',
      ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns'],
      ifDoesNotHaveFeatureFlag('enableSystemNotices')
    ),
    createLink(
      'Notices',
      '/system/notices',
      ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns'],
      ifHasFeatureFlag('enableSystemNotices')
    ),
    createLink(
      'Returns cycles',
      '/returns-reports',
      'returns'
    ),
    createLink(
      'Digitise!',
      '/digitise/report',
      'ar_approver'
    ),
    createLink(
      'Key performance indicators',
      '/reporting/kpi-reporting',
      ['ar_approver', 'billing', 'bulk_return_notifications', 'hof_notifications', 'manage_accounts', 'renewal_notifications', 'returns']
    )
  ],
  returnNotifications: [
    createLink(
      'Invitations',
      '/returns-notifications/invitations',
      'bulk_return_notifications',
      ifDoesNotHaveFeatureFlag('enableSystemNotifications')
    ),
    createLink(
      'Invitations',
      '/system/notices/setup/standard?noticeType=invitations',
      'bulk_return_notifications',
      ifHasFeatureFlag('enableSystemNotifications')
    ),
    createLink(
      'Paper forms',
      '/returns-notifications/forms',
      'returns'
    ),
    createLink(
      'Reminders',
      '/returns-notifications/reminders',
      'bulk_return_notifications',
      ifDoesNotHaveFeatureFlag('enableSystemNotifications')
    ),
    createLink(
      'Reminders',
      '/system/notices/setup/standard?noticeType=reminders',
      'bulk_return_notifications',
      ifHasFeatureFlag('enableSystemNotifications')
    ),
    createLink(
      'Ad-hoc',
      '/system/notices/setup/adhoc',
      'returns',
      ifHasFeatureFlag('enableAdHocNotifications')
    )
  ],
  uploadChargeInformation: [
    createLink(
      'Upload a file',
      '/charge-information/upload',
      'charge_version_workflow_reviewer',
      ifHasFeatureFlag('allowChargeVersionUploads')
    )
  ]
}

/**
 * Provides the items for the `/manage` page
 *
 * It simply filters the full list of potential links according to the user's defined scopes and the current
 * feature flag settings.
 *
 * @param {Array<string>|string} userScopes - The value of the user's `scope` attribute
 *
 * @returns {Promise<object>} The view data for the Manage page
 */
async function go(userScopes) {
  const filteredLinks = { ...ALL_LINKS }
  const userScopesArray = Array.isArray(userScopes) ? userScopes : [userScopes]
  const scopeFilter = (linkScope) => {
    return userScopesArray.includes(linkScope)
  }

  Object.keys(filteredLinks).forEach((key) => {
    filteredLinks[key] = filteredLinks[key]
      .filter((link) => {
        return link.featureFlagCheck() && link.scopes.some(scopeFilter)
      })
      .map(({ name, path }) => {
        return { name, path }
      })
  })

  return {
    activeNavBar: 'manage',
    pageTitle: 'Manage reports and notices',
    ...filteredLinks
  }
}

module.exports = {
  go
}
