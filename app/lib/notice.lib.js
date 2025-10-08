'use strict'

/**
 * Fixed data for the Notice journey
 * @module NoticeLib
 */

const NoticeJourney = Object.freeze({ STANDARD: 'standard', ALERTS: 'alerts' })

const NoticeType = Object.freeze({
  ABSTRACTION_ALERTS: 'abstractionAlerts',
  INVITATIONS: 'invitations',
  PAPER_RETURN: 'returnForms',
  REMINDERS: 'reminders'
})

module.exports = { NoticeJourney, NoticeType }
