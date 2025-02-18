'use strict'

/**
 * Config values used for GOV.UK Notify
 * @module NotifyConfig
 */

// We require dotenv directly in each config file to support unit tests that depend on this subset of config.
// Requiring dotenv in multiple places has no effect on the app when running for real.
require('dotenv').config()

const config = {
  apiKey: process.env.GOV_UK_NOTIFY_API_KEY,
  template: {
    returnsInvitationPrimaryUserEmail: process.env.NOTIFY_TEMPLATE_RETURNS_INVITATION_PRIMARY_USER_EMAIL
  }
}

module.exports = config
