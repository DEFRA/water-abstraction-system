'use strict'

/**
 * Provides the items for the `/manage` page
 * @module ViewManageService
 */

const config = require('../../../config/feature-flags.config.js')

const SCOPE_RETURNS = 'returns'
const SCOPE_BULK_RETURNS_NOTIFICATIONS = 'bulk_return_notifications'
const SCOPE_ABSTRACTION_REFORM_APPROVER = 'ar_approver'
const SCOPE_HOF_NOTIFICATIONS = 'hof_notifications'
const SCOPE_RENEWAL_NOTIFICATIONS = 'renewal_notifications'
const SCOPE_MANAGE_ACCOUNTS = 'manage_accounts'
const SCOPE_BILLING = 'billing'
const SCOPE_CHARGE_VERSION_WORKFLOW_REVIEWER = 'charge_version_workflow_reviewer'
const SCOPE_CHARGE_VERSION_WORKFLOW_EDITOR = 'charge_version_workflow_editor'

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
  abstractionReformApprover: [SCOPE_ABSTRACTION_REFORM_APPROVER],
  returns: [SCOPE_RETURNS],
  bulkReturnNotifications: [SCOPE_BULK_RETURNS_NOTIFICATIONS],
  hofNotifications: [SCOPE_HOF_NOTIFICATIONS],
  renewalNotifications: [SCOPE_RENEWAL_NOTIFICATIONS],
  allNotifications: [
    SCOPE_RETURNS,
    SCOPE_HOF_NOTIFICATIONS,
    SCOPE_RENEWAL_NOTIFICATIONS,
    SCOPE_BULK_RETURNS_NOTIFICATIONS
  ],
  manageAccounts: [SCOPE_MANAGE_ACCOUNTS],
  chargeVersionWorkflowReviewer: [SCOPE_CHARGE_VERSION_WORKFLOW_REVIEWER],
  chargeVersionWorkflow: [SCOPE_CHARGE_VERSION_WORKFLOW_REVIEWER, SCOPE_CHARGE_VERSION_WORKFLOW_EDITOR]
}

const createLink = (name, path, scopes) => {
  return { name, path, scopes }
}

const linkForNotices = () => {
  return createLink(
    'Notices',
    config.enableSystemNotices ? '/system/notices' : '/notifications/report',
    SCOPES.allNotifications
  )
}
const linkForInvitations = () => {
  return createLink(
    'Invitations',
    config.enableSystemNotifications
      ? '/system/notices/setup/standard?noticeType=invitations'
      : '/returns-notifications/invitations',
    SCOPES.bulkReturnNotifications
  )
}
const linkForReminders = () => {
  return createLink(
    'Reminders',
    config.enableSystemNotifications
      ? '/system/notices/setup/standard?noticeType=reminders'
      : '/returns-notifications/reminders',
    SCOPES.bulkReturnNotifications
  )
}

const allLinksForReports = () => {
  return [
    linkForNotices(),
    createLink('Returns cycles', '/returns-reports', SCOPES.returns),
    createLink('Digitise!', '/digitise/report', SCOPES.abstractionReformApprover),
    createLink('Key performance indicators', '/reporting/kpi-reporting', SCOPES.hasManageTab)
  ]
}
const allLinksForReturnNotifications = () => {
  return [
    linkForInvitations(),
    createLink('Paper forms', '/returns-notifications/forms', SCOPES.returns),
    linkForReminders(),
    createLink('Ad-hoc', '/system/notices/setup/adhoc', config.enableAdHocNotifications && SCOPES.returns)
  ]
}
const allLinksForLicenceNotifications = () => {
  return [createLink('Renewal', 'notifications/2?start=1', SCOPES.renewalNotifications)]
}
const allLinksForHofNotifications = () => {
  return [
    createLink('Restriction', 'notifications/1?start=1', SCOPES.hofNotifications),
    createLink('Hands-off flow', 'notifications/3?start=1', SCOPES.hofNotifications),
    createLink('Resume', 'notifications/4?start=1', SCOPES.hofNotifications)
  ]
}
const allLinksForUploadChargeInformation = () => {
  return [
    createLink(
      'Upload a file',
      '/charge-information/upload',
      config.allowChargeVersionUploads && SCOPES.chargeVersionWorkflowReviewer
    )
  ]
}
const allLinksForAccounts = () => {
  return [createLink('Create an internal account', '/account/create-user', SCOPES.manageAccounts)]
}
const allLinksForChargeInformationWorkflow = () => {
  return [createLink('Check licences in workflow', '/charge-information-workflow', SCOPES.chargeVersionWorkflow)]
}

const allLinks = () => {
  return {
    reports: allLinksForReports(),
    returnNotifications: allLinksForReturnNotifications(),
    licenceNotifications: allLinksForLicenceNotifications(),
    hofNotifications: allLinksForHofNotifications(),
    uploadChargeInformation: allLinksForUploadChargeInformation(),
    accounts: allLinksForAccounts(),
    chargeInformationWorkflow: allLinksForChargeInformationWorkflow()
  }
}

/**
 * Provides the items for the `/manage` page
 *
 * It simply filters the full list of potential links according to the user's defined scopes.
 *
 * @param {Array<string>|string} userScopes - The value of the user's `scope` attribute
 *
 * @returns {Promise<object>} The view data for the profile details page
 */
async function go(userScopes) {
  const userScopesArray = Array.isArray(userScopes) ? userScopes : [userScopes]

  const userHasScopeForLink = (linkScopes) => {
    return linkScopes.some((linkScope) => {
      return userScopesArray.includes(linkScope)
    })
  }

  const linksForUser = Object.entries(allLinks()).reduce((newSections, [sectionName, links]) => {
    newSections[sectionName] = links.filter((item) => {
      return userHasScopeForLink(item.scopes)
    })
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
