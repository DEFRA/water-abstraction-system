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

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

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
    _createLink(
      'Create an internal account',
      '/account/create-user',
      ['manage_accounts']
    )
  ],
  chargeInformationWorkflow: [
    _createLink(
      'Check licences in workflow',
      '/charge-information-workflow',
      ['charge_version_workflow_editor', 'charge_version_workflow_reviewer']
    )
  ],
  hofNotifications: [
    _createLink(
      'Restriction',
      'notifications/1?start=1',
      ['hof_notifications']
    ),
    _createLink(
      'Hands-off flow',
      'notifications/3?start=1',
      ['hof_notifications']
    ),
    _createLink(
      'Resume',
      'notifications/4?start=1',
      ['hof_notifications']
    )
  ],
  licenceNotifications: [
    _createLink(
      'Renewal',
      'notifications/2?start=1',
      ['renewal_notifications']
    )
  ],
  reports: [
    _createLink(
      'Notices',
      '/notifications/report',
      ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns'],
      _ifDoesNotHaveFeatureFlag('enableSystemNotices')
    ),
    _createLink(
      'Notices',
      '/system/notices',
      ['bulk_return_notifications', 'hof_notifications', 'renewal_notifications', 'returns'],
      _ifHasFeatureFlag('enableSystemNotices')
    ),
    _createLink(
      'Returns cycles',
      '/returns-reports',
      ['returns']
    ),
    _createLink(
      'Digitise!',
      '/digitise/report',
      ['ar_approver']
    ),
    _createLink(
      'Key performance indicators',
      '/reporting/kpi-reporting',
      ['ar_approver', 'billing', 'bulk_return_notifications', 'hof_notifications', 'manage_accounts', 'renewal_notifications', 'returns']
    )
  ],
  returnNotifications: [
    _createLink(
      'Invitations',
      '/returns-notifications/invitations',
      ['bulk_return_notifications'],
      _ifDoesNotHaveFeatureFlag('enableSystemNotifications')
    ),
    _createLink(
      'Invitations',
      '/system/notices/setup/standard?noticeType=invitations',
      ['bulk_return_notifications'],
      _ifHasFeatureFlag('enableSystemNotifications')
    ),
    _createLink(
      'Paper forms',
      '/returns-notifications/forms',
      ['returns']
    ),
    _createLink(
      'Reminders',
      '/returns-notifications/reminders',
      ['bulk_return_notifications'],
      _ifDoesNotHaveFeatureFlag('enableSystemNotifications')
    ),
    _createLink(
      'Reminders',
      '/system/notices/setup/standard?noticeType=reminders',
      ['bulk_return_notifications'],
      _ifHasFeatureFlag('enableSystemNotifications')
    ),
    _createLink(
      'Ad-hoc',
      '/system/notices/setup/adhoc',
      ['returns'],
      _ifHasFeatureFlag('enableAdHocNotifications')
    )
  ],
  uploadChargeInformation: [
    _createLink(
      'Upload a file',
      '/charge-information/upload',
      ['charge_version_workflow_reviewer'],
      _ifHasFeatureFlag('allowChargeVersionUploads')
    )
  ]
}

/**
 * Provides the items for the `/manage` page
 *
 * It filters the full list of potential links according to the user's defined scopes and the current feature flag
 * settings and returns just the link name and path for display in the view.
 *
 * @param {object} userAuth - The value of the current user's `auth` attribute
 *
 * @returns {Promise<object>} The view data for the Manage page
 */
async function go(userAuth) {
  const linkFilter = _makeLinkFilter(userAuth.credentials.scope)

  const filteredLinks = {}

  Object.entries(ALL_LINKS).forEach(([key, links]) => {
    filteredLinks[key] = links.filter(linkFilter).map(_linkMapper)
  })

  return {
    activeNavBar: 'manage',
    pageTitle: 'Manage reports and notices',
    ...filteredLinks
  }
}

/**
 * Creates a filter function for the links based on the user's scopes
 *
 * @param {Array<string>} userScopes - The scopes assigned to the user
 *
 * @returns {function(object): boolean} The link filter function
 */
function _makeLinkFilter(userScopes) {
  return (link) => {
    return (
      link.featureFlagCheck() &&
      link.scopes.some((linkScope) => {
        return userScopes.includes(linkScope)
      })
    )
  }
}

/**
 * Maps the link object to a simpler format for the view
 *
 * @param {object} link - The link object
 * @param {object} link.name - The link name
 * @param {object} link.path - The link path
 *
 * @returns {object} The mapped link object
 */
function _linkMapper({ name, path }) {
  return { name, path }
}

/**
 * Creates a link object for a specific item on the page
 *
 * @param {string} name - The name of the link
 * @param {string} path - The path of the link
 * @param {Array<string>} scopes - The scopes required to view the link
 * @param {function(): boolean} featureFlagCheck - A function that checks if the relevant feature flag is enabled
 *
 * @returns {object} The link object
 */
function _createLink(name, path, scopes, featureFlagCheck = _irrespectiveOfFeatureFlags) {
  return { featureFlagCheck, name, path, scopes }
}

/**
 * Provides a function that dynamically checks if a feature flag is enabled
 *
 * These functions are used to ensure that the feature flags are checked at the time that the page is being displayed,
 * which allows them to be checked by our unit tests.
 *
 * @param {string} featureFlag - The name of the feature flag to be checked
 *
 * @returns {function(): boolean}
 */
function _ifHasFeatureFlag(featureFlag) {
  return () => {
    return FeatureFlagsConfig[featureFlag]
  }
}

/**
 * Provides a function that dynamically checks if a feature flag is not enabled
 *
 * These functions are used to ensure that the feature flags are checked at the time that the page is being displayed,
 * which allows them to be checked by our unit tests.
 *
 * @param {string} featureFlag - The name of the feature flag to be checked
 *
 * @returns {function(): boolean}
 */
function _ifDoesNotHaveFeatureFlag(featureFlag) {
  return () => {
    return !FeatureFlagsConfig[featureFlag]
  }
}

/**
 * A default function to use if the link on the page is not dependent on a feature flag
 *
 * @returns {boolean} Always true
 */
function _irrespectiveOfFeatureFlags() {
  return true
}

module.exports = {
  go
}
