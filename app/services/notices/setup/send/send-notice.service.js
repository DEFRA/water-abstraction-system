'use strict'

/**
 * Orchestrates sending the first main notice to Notify, then checking if an alternate needs creating and sending
 * @module SendNoticeService
 */

const SendAlternateNoticeService = require('./send-alternate-notice.service.js')
const SendMainNoticeService = require('./send-main-notice.service.js')
const UpdateNoticeService = require('../../update-notice.service.js')

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

    const { id: noticeId, subtype } = notice

    await SendMainNoticeService.go(notice, notifications)

    const noticesToUpdate = [noticeId]

    // We only check if a failed notice is needed if the original notice was a returns invitation.
    if (subtype === 'returnInvitation') {
      const alternateNotice = await SendAlternateNoticeService.go(notice)

      if (alternateNotice) {
        noticesToUpdate.push(alternateNotice.id)
      }
    }

    await UpdateNoticeService.go(noticesToUpdate)

    calculateAndLogTimeTaken(startTime, 'Send notice complete', { count: notifications.length, noticeId })
  } catch (error) {
    global.GlobalNotifier.omfg('Send notice failed', { notice }, error)
  }
}

module.exports = {
  go
}
