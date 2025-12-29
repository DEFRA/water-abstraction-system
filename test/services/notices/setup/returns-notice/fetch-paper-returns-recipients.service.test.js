'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticeSessionFixture = require('../../../../fixtures/notice-session.fixture.js')
const RecipientsSeeder = require('../../../../support/seeders/recipients.seeder.js')
const ReturnLogHelper = require('../../../../support/helpers/return-log.helper.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

// Thing under test
const FetchPaperReturnsRecipientsService = require('../../../../../app/services/notices/setup/returns-notice/fetch-paper-returns-recipients.service.js')

describe('Notices - Setup - Returns Notice - Fetch Paper Returns Recipients service', () => {
  let download
  let licenceHolder
  let licenceRef
  let session
  let setDueDateReturnLog

  before(async () => {
    licenceRef = generateLicenceRef()

    // Create a return log with a populated `dueDate`.
    setDueDateReturnLog = await ReturnLogHelper.add({ dueDate: new Date('2025-04-28'), licenceRef })

    session = NoticeSessionFixture.paperReturn(licenceRef, setDueDateReturnLog)

    licenceHolder = await RecipientsSeeder.licenceHolder('Test Licence Holder', licenceRef)
    licenceHolder.licenceRefs = [licenceRef]
    licenceHolder.returnLogIds = [setDueDateReturnLog.returnId]
  })

  after(async () => {
    await setDueDateReturnLog.$query().delete()

    await RecipientsSeeder.clean(licenceHolder)
  })

  describe('when service is called for sending or checking recipients', () => {
    before(() => {
      download = false
    })

    it('fetches the correct recipient data for sending the notice', async () => {
      const results = await FetchPaperReturnsRecipientsService.go(session, download)

      // NOTE: Unlike returns invitations and reminders, the notification due date is not determined for a paper return
      // until we generate the notification itself. This is because we send a notification per recipient and return log
      // combination, and the notification due date is determined based on the selected return log. So, the
      // PaperReturnNotificationsPresenter handles it. But the service sets it to null to return an object consistent
      // with FetchReturnsInvitationRecipients and FetchReturnsReminderRecipients.
      const sendingResult = RecipientsSeeder.transformToSendingResult(licenceHolder)

      sendingResult.due_date_status = 'all populated'
      sendingResult.latest_due_date = setDueDateReturnLog.dueDate
      sendingResult.notificationDueDate = null

      expect(results).to.equal([sendingResult])
    })
  })

  describe('when the service is called for generating a download', () => {
    before(() => {
      download = true
    })

    it('fetches the correct recipient data for the download', async () => {
      const results = await FetchPaperReturnsRecipientsService.go(session, download)

      // NOTE: When fetching data for the download, the service _can_ determine the notification due date because each
      // row is distinct to a recipient and return log combination.
      const downloadingResult = RecipientsSeeder.transformToDownloadingResult(licenceHolder, setDueDateReturnLog)

      downloadingResult.notificationDueDate = new Date('2025-04-28')

      expect(results).to.equal([downloadingResult])
    })
  })
})
