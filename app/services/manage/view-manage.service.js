'use strict'

/**
 * Provides the items for the `/manage` page
 * @module ViewManageService
 */

const config = require('../../../config/feature-flags.config.js')

const SCOPE_RETURNS = 'returns'
const SCOPE_BULK_RETURNS_NOTIFICATIONS = 'bulk_return_notifications'
const SCOPE_ABSTRACTION_REFORM_USER = 'ar_user'
const SCOPE_ABSTRACTION_REFORM_APPROVER = 'ar_approver'
const SCOPE_HOF_NOTIFICATIONS = 'hof_notifications'
const SCOPE_RENEWAL_NOTIFICATIONS = 'renewal_notifications'
const SCOPE_MANAGE_ACCOUNTS = 'manage_accounts'
const SCOPE_BILLING = 'billing'
const SCOPE_DELETE_AGREEMENTS = 'delete_agreements'
const SCOPE_MANAGE_AGREEMENTS = 'manage_agreements'
const SCOPE_CHARGE_VERSION_WORKFLOW_REVIEWER = 'charge_version_workflow_reviewer'
const SCOPE_CHARGE_VERSION_WORKFLOW_EDITOR = 'charge_version_workflow_editor'
const SCOPE_MANAGE_BILLING_ACCOUNTS = 'manage_billing_accounts'
const SCOPE_VIEW_CHARGE_VERSIONS = 'view_charge_versions'
const SCOPE_MANAGE_GAUGING_STATION_LICENCE_LINKS = 'manage_gauging_station_licence_links'

const SCOPES = {
  hasManageTab: [
    SCOPE_RETURNS,
    SCOPE_BULK_RETURNS_NOTIFICATIONS,
    SCOPE_ABSTRACTION_REFORM_APPROVER,
    SCOPE_HOF_NOTIFICATIONS,
    SCOPE_RENEWAL_NOTIFICATIONS,
    SCOPE_MANAGE_ACCOUNTS,
    SCOPE_BILLING
  ],
  abstractionReformUser: [ SCOPE_ABSTRACTION_REFORM_USER ],
  abstractionReformApprover: [ SCOPE_ABSTRACTION_REFORM_APPROVER ],
  returns: [ SCOPE_RETURNS ],
  bulkReturnNotifications: [ SCOPE_BULK_RETURNS_NOTIFICATIONS ],
  hofNotifications: [ SCOPE_HOF_NOTIFICATIONS ],
  renewalNotifications: [ SCOPE_RENEWAL_NOTIFICATIONS ],
  allNotifications: [
    SCOPE_RETURNS,
    SCOPE_HOF_NOTIFICATIONS,
    SCOPE_RENEWAL_NOTIFICATIONS,
    SCOPE_BULK_RETURNS_NOTIFICATIONS
  ],
  manageAccounts: [ SCOPE_MANAGE_ACCOUNTS ],
  billing: [ SCOPE_BILLING ],
  deleteAgreements: [ SCOPE_DELETE_AGREEMENTS ],
  manageAgreements: [ SCOPE_MANAGE_AGREEMENTS ],
  chargeVersionWorkflowReviewer: [ SCOPE_CHARGE_VERSION_WORKFLOW_REVIEWER ],
  chargeVersionWorkflowEditor: [ SCOPE_CHARGE_VERSION_WORKFLOW_EDITOR ],
  manageBillingAccounts: [ SCOPE_MANAGE_BILLING_ACCOUNTS ],
  viewChargeVersions: [ SCOPE_VIEW_CHARGE_VERSIONS ],
  manageGaugingStationLicenceLinks: [ SCOPE_MANAGE_GAUGING_STATION_LICENCE_LINKS ]
}

const createLink = (name, path, scopes) => ({ name, path, scopes })

const userHasScopeForLink = (userScopes, linkScopes) => linkScopes.some(linkScope => userScopes.includes(linkScope))

const ALL_LINKS = {
  reports: [
    createLink('Notices', config.enableSystemNotices ? '/system/notices' : '/notifications/report', SCOPES.allNotifications),
    createLink('Returns cycles', '/returns-reports', SCOPES.returns),
    createLink('Digitise!', '/digitise/report', SCOPES.abstractionReformApprover),
    createLink('Key performance indicators', '/reporting/kpi-reporting', SCOPES.hasManageTab)
  ],
  returnNotifications: [
    createLink('Invitations', config.enableSystemNotifications ? '/system/notices/setup/standard?noticeType=invitations' : '/returns-notifications/invitations', SCOPES.bulkReturnNotifications),
    createLink('Paper forms', '/returns-notifications/forms', SCOPES.returns),
    createLink('Reminders', config.enableSystemNotifications ? '/system/notices/setup/standard?noticeType=reminders' : '/returns-notifications/reminders', SCOPES.bulkReturnNotifications),
    createLink('Ad-hoc', '/system/notices/setup/adhoc', config.enableAdHocNotifications && SCOPES.returns)
  ],
  licenceNotifications: [createLink('Renewal', 'notifications/2?start=1', SCOPES.renewalNotifications)],
  hofNotifications: [
    createLink('Restriction', 'notifications/1?start=1', SCOPES.hofNotifications),
    createLink('Hands-off flow', 'notifications/3?start=1', SCOPES.hofNotifications),
    createLink('Resume', 'notifications/4?start=1', SCOPES.hofNotifications)
  ],
  uploadChargeInformation: [
    createLink(
      'Upload a file',
      '/charge-information/upload',
      config.allowChargeVersionUploads && SCOPES.chargeVersionWorkflowReviewer
    )
  ],
  accounts: [createLink('Create an internal account', '/account/create-user', SCOPES.manageAccounts)],
  chargeInformationWorkflow: [
    createLink('Check licences in workflow', '/charge-information-workflow', [
      SCOPES.chargeVersionWorkflowEditor,
      SCOPES.chargeVersionWorkflowReviewer
    ])
  ]
}



/**
 * Provides the items for the `/manage` page
 *
 * It simply filters the full list of potential links according to the user's defined scopes.
 *
 * @param {Array<string>} userScopes - The value of the user's `scope` attribute
 *
 * @returns {Promise<object>} The view data for the profile details page
 */
async function go(userScopes) {
  const userScopesArray = Array.isArray(userScopes) ? userScopes : [userScopes]
  const linksForUser = Object.entries(ALL_LINKS).reduce((newSections, [sectionName, links]) => {
    newSections[sectionName] = links.filter(item => userHasScopeForLink(userScopesArray, item.scopes))
    return newSections
  }, {})

  return {
    activeNavBar: 'manage',
    pageTitle: 'Manage reports and notices',
    ...linksForUser
  }
}

module.exports = {
  go
}
