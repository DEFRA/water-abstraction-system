'use strict'

/**
 * Formats data for the `/manage` page
 * @module ManagePresenter
 */

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// There is no direct correlation between user scopes and management items, so we need to map them manually, each scope
// has a set of associated management items that will be shown when the user has that scope.
const ITEMS_BY_SCOPE = {
  ar_approver: new Set(['showDigitise', 'showKPIs']),
  billing: new Set(['showKPIs']),
  bulk_return_notifications: new Set(['showInvitations', 'showKPIs', 'showNotices', 'showReminders']),
  charge_version_workflow_editor: new Set(['showCheckLicences']),
  charge_version_workflow_reviewer: new Set(['showCheckLicences']),
  hof_notifications: new Set(['showHandsOffFlow', 'showKPIs', 'showNotices', 'showRestriction', 'showResume']),
  manage_accounts: new Set(['showCreateAccount', 'showKPIs']),
  renewal_notifications: new Set(['showKPIs', 'showNotices', 'showRenewal']),
  returns: new Set(['showAdHoc', 'showKPIs', 'showNotices', 'showPaperForms', 'showReturnsCycles'])
}

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
  const itemsForUserScopes = _determineItemsForUserScopes(userScopes)

  // Ad-hoc is dependent on a feature flag
  if (!FeatureFlagsConfig.enableAdHocNotifications) {
    itemsForUserScopes.delete('showAdHoc')
  }

  return {
    pageTitle: 'Manage reports and notices',
    ..._convertItemSetToObject(itemsForUserScopes)
  }
}

function _determineItemsForUserScopes(userScopes) {
  let itemsForUserScopes

  itemsForUserScopes = new Set()
  userScopes.forEach((scope) => {
    if (ITEMS_BY_SCOPE[scope]) {
      itemsForUserScopes = itemsForUserScopes.union(ITEMS_BY_SCOPE[scope])
    }
  })

  return itemsForUserScopes
}

function _convertItemSetToObject(itemSet) {
  const itemObject = {}

  itemSet.forEach((item) => {
    itemObject[item] = true
  })

  return itemObject
}

module.exports = {
  go
}
