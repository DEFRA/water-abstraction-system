'use strict'

/**
 * Formats data for the `/manage` page
 * @module ManagePresenter
 */

const featureFlagsConfig = require('../../../config/feature-flags.config.js')

/**
 * Formats data for the `/manage` page
 *
 * It takes the current user's scopes and returns an object containing the visibility of various management links based
 * on those scopes.
 *
 * @param {object} userScopes - The current user's scopes
 *
 * @returns {object} - The data formatted for the view template
 */
function go(userScopes) {
  return {
    flowNotices: _flowNotices(userScopes),
    licenceNotices: _licenceNotices(userScopes),
    manageUsers: _manageUsers(userScopes),
    pageTitle: 'Manage reports and notices',
    returnNotices: _returnNotices(userScopes),
    viewReports: _viewReports(userScopes),
    viewWorkflow: _viewWorkflow(userScopes)
  }
}

function _flowNotices(userScopes) {
  const links = {
    restriction: _hasPermission(userScopes, ['hof_notifications']),
    handsOffFlow: _hasPermission(userScopes, ['hof_notifications']),
    resume: _hasPermission(userScopes, ['hof_notifications'])
  }

  return {
    show: Object.values(links).includes(true),
    links
  }
}

/**
 * Checks if a user has any of the scopes required to view a management link
 *
 * @param {string[]} userScopes - The scopes of the current user
 * @param {string[]} linkScopes - The scopes required to view the link
 *
 * @returns {boolean} - true if the user has any of the required scopes, false otherwise
 */
function _hasPermission(userScopes, linkScopes) {
  return linkScopes.some((scope) => {
    return userScopes.includes(scope)
  })
}

function _licenceNotices(userScopes) {
  const links = {
    renewal: _hasPermission(userScopes, ['renewal_notifications'])
  }

  return { show: links.renewal, links }
}

function _manageUsers(userScopes) {
  const links = {
    createAccount: _hasPermission(userScopes, ['manage_accounts'])
  }

  return { show: links.createAccount, links }
}

function _returnNotices(userScopes) {
  const links = {
    invitations: _hasPermission(userScopes, ['bulk_return_notifications']),
    paperForms: _hasPermission(userScopes, ['returns']),
    reminders: _hasPermission(userScopes, ['bulk_return_notifications']),
    adHoc: _hasPermission(userScopes, ['returns']) && featureFlagsConfig.enableAdHocNotifications
  }

  return { show: Object.values(links).includes(true), links }
}

function _viewReports(userScopes) {
  const links = {
    notices: _hasPermission(userScopes, [
      'bulk_return_notifications',
      'hof_notifications',
      'renewal_notifications',
      'returns'
    ]),
    returnsCycles: _hasPermission(userScopes, ['returns']),
    digitise: _hasPermission(userScopes, ['ar_approver']),
    kpis: _hasPermission(userScopes, [
      'ar_approver',
      'billing',
      'bulk_return_notifications',
      'hof_notifications',
      'manage_accounts',
      'renewal_notifications',
      'returns'
    ])
  }

  return { show: Object.values(links).includes(true), links }
}

function _viewWorkflow(userScopes) {
  const links = {
    checkLicences: _hasPermission(userScopes, ['charge_version_workflow_editor', 'charge_version_workflow_reviewer'])
  }

  return { show: links.checkLicences, links }
}

module.exports = {
  go
}
