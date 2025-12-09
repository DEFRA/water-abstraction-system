'use strict'

/**
 * Orchestrates sending the first main notice to Notify, then checking if an alternate needs creating and sending
 * @module SendNoticeService
 */

const SendMainNoticeService = require('./send-main-notice.service.js')

const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../../lib/general.lib.js')

/**
 * Orchestrates sending the first main notice to Notify, then checking if an alternate needs creating and sending
 *
 * @param {object} notice - The main notice to be sent
 * @param {object[]} notifications - The main notifications linked to the main notice to be sent
 */
async function go(notice, notifications) {
  try {
    const startTime = currentTimeInNanoseconds()

    await SendMainNoticeService.go(notice, notifications)

    calculateAndLogTimeTaken(startTime, 'Send notice complete', { count: notifications.length, noticeId: notice.id })
  } catch (error) {
    global.GlobalNotifier.omfg('Send notice failed', { notice }, error)
  }
}

module.exports = {
  go
}
