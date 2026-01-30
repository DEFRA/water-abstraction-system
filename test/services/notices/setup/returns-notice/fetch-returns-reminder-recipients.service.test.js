'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticeSessionFixture = require('../../../../support/fixtures/notice-session.fixture.js')
const RecipientsSeeder = require('../../../../support/seeders/recipients.seeder.js')
const ReturnLogHelper = require('../../../../support/helpers/return-log.helper.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

// Thing under test
const FetchReturnsReminderRecipients = require('../../../../../app/services/notices/setup/returns-notice/fetch-returns-reminder-recipients.service.js')

describe('Notices - Setup - Returns Notice - Fetch Returns Reminder Recipients service', () => {
  let download
  let licenceHolder
  let licenceRef
  let nullDueDateReturnLog
  let session
  let setDueDateReturnLog

  before(async () => {
    licenceRef = generateLicenceRef()

    // NOTE: GenerateRecipientsQueryService for downloads will order by return ID (it has to because of the distinct
    // clause). So, we generate two IDs, sort them, and then use them when creating the return logs to ensure our
    // expectations match the order of the results.
    const returnLogIds = [generateUUID(), generateUUID()].sort()

    // Create a return log with a null `dueDate`.
    nullDueDateReturnLog = await ReturnLogHelper.add({
      dueDate: null,
      endDate: new Date('2025-03-01'),
      id: returnLogIds[0],
      licenceRef,
      quarterly: false,
      startDate: new Date('2024-04-01')
    })

    // Create a return log with a populated `dueDate`.
    setDueDateReturnLog = await ReturnLogHelper.add({
      dueDate: '2025-04-28',
      endDate: new Date('2025-03-01'),
      id: returnLogIds[1],
      licenceRef,
      quarterly: false,
      startDate: new Date('2024-04-01')
    })

    licenceHolder = await RecipientsSeeder.licenceHolder('Test Licence Holder', licenceRef)
    licenceHolder.licenceRefs = [licenceRef]
  })

  after(async () => {
    await nullDueDateReturnLog.$query().delete()
    await setDueDateReturnLog.$query().delete()

    await RecipientsSeeder.clean(licenceHolder)
  })

  describe('when the set up journey is "ad-hoc"', () => {
    before(() => {
      session = NoticeSessionFixture.adHocReminder(licenceRef)
    })

    describe('and the query is NOT for generating a download', () => {
      before(() => {
        download = false
      })

      it('fetches the correct recipient data for sending the notice', async () => {
        const results = await FetchReturnsReminderRecipients.go(session, download)

        // NOTE: We know GenerateReturnLogsByLicenceQueryService when called for a returns reminder will generate a
        // query that will only fetch return logs with due dates. So, we know only the return log with the due date will
        // feature in the `return_log_ids` property of the result
        const sendingResult = RecipientsSeeder.transformToSendingResult({
          ...licenceHolder,
          returnLogIds: [setDueDateReturnLog.id]
        })

        // And we know the query will _always_ return a `due_date_status` of 'all populated', and the latest due date
        // to that of our return log.
        sendingResult.due_date_status = 'all populated'
        sendingResult.latest_due_date = setDueDateReturnLog.dueDate

        // Finally, in the case of returns reminders, the service will set the notificationDueDate for each recipient
        // to be the latest due date.
        sendingResult.notificationDueDate = setDueDateReturnLog.dueDate

        expect(results).to.equal([sendingResult])
      })
    })

    describe('and the query is for generating a download', () => {
      before(() => {
        download = true
      })

      it('fetches the correct recipient data for the download', async () => {
        const results = await FetchReturnsReminderRecipients.go(session, download)

        const downloadingResult = RecipientsSeeder.transformToDownloadingResult(licenceHolder, setDueDateReturnLog)

        downloadingResult.notificationDueDate = setDueDateReturnLog.dueDate

        expect(results).to.equal([downloadingResult])
      })
    })
  })

  describe('when the set up journey is "standard"', () => {
    before(() => {
      session = NoticeSessionFixture.standardReminder(licenceRef)
    })

    describe('and the query is NOT for generating a download', () => {
      before(() => {
        download = false
      })

      it('fetches the correct recipient data for sending the notice', async () => {
        const results = await FetchReturnsReminderRecipients.go(session, download)

        // NOTE: We know GenerateReturnLogsByPeriodQueryService when called for a returns reminder will generate a
        // query that will only fetch return logs with due dates. So, we know only the return log with the due date will
        // feature in the `return_log_ids` property of the result
        const sendingResult = RecipientsSeeder.transformToSendingResult({
          ...licenceHolder,
          returnLogIds: [setDueDateReturnLog.id]
        })

        // And we know the query will _always_ return a `due_date_status` of 'all populated', and the latest due date
        // to that of our return log.
        sendingResult.due_date_status = 'all populated'
        sendingResult.latest_due_date = setDueDateReturnLog.dueDate

        // Finally, in the case of returns reminders, the service will set the notificationDueDate for each recipient
        // to be the latest due date.
        sendingResult.notificationDueDate = setDueDateReturnLog.dueDate

        expect(results).to.equal([sendingResult])
      })
    })

    describe('and the query is for generating a download', () => {
      before(() => {
        download = true
      })

      it('fetches the correct recipient data for the download', async () => {
        const results = await FetchReturnsReminderRecipients.go(session, download)

        const downloadingResult = RecipientsSeeder.transformToDownloadingResult(licenceHolder, setDueDateReturnLog)

        downloadingResult.notificationDueDate = setDueDateReturnLog.dueDate

        expect(results).to.equal([downloadingResult])
      })
    })
  })
})
