// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import * as NoticeSessionFixture from '../../../../support/fixtures/notice-session.fixture.js'
import * as RecipientScenariosSeeder from '../../../../support/seeders/recipient-scenarios.seeder.js'
import ReturnLogHelper from '../../../../support/helpers/return-log.helper.js'

// Thing under test
import FetchReturnsReminderRecipients from '../../../../../app/services/notices/setup/returns-notice/fetch-returns-reminder-recipients.service.js'

describe('Notices - Setup - Returns Notice - Fetch Returns Reminder Recipients service', () => {
  let download
  let nullDueDateReturnLog
  let session
  let setDueDateReturnLog
  let scenarios

  beforeAll(async () => {
    scenarios = {}

    // 1) Licence holder only
    // Create a return log with a populated `dueDate`.
    setDueDateReturnLog = await ReturnLogHelper.add({
      dueDate: '2025-04-28',
      endDate: new Date('2025-03-01'),
      quarterly: false,
      startDate: new Date('2024-04-01')
    })

    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly([setDueDateReturnLog])

    // NOTE: Create a null due date return log for the same licence to verify the reminder query filters these out
    nullDueDateReturnLog = await ReturnLogHelper.add({
      dueDate: null,
      endDate: new Date('2025-03-01'),
      licenceRef: setDueDateReturnLog.licenceRef,
      quarterly: false,
      startDate: new Date('2024-04-01')
    })
  })

  afterAll(async () => {
    await nullDueDateReturnLog.$query().delete()
    await setDueDateReturnLog.$query().delete()
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when the set up journey is "ad-hoc"', () => {
    beforeAll(() => {
      session = NoticeSessionFixture.adHocReminder(scenarios.licenceHolder.licenceHolderRecipient.licenceRefs[0])
    })

    describe('and the query is NOT for generating a download', () => {
      beforeAll(() => {
        download = false
      })

      it('fetches the correct recipient data for sending the notice', async () => {
        const results = await FetchReturnsReminderRecipients(session, download)

        // NOTE: We know GenerateReturnLogsByLicenceQueryService when called for a returns reminder will generate a
        // query that will only fetch return logs with due dates. So, we know only the return log with the due date will
        // feature in the `return_log_ids` property of the result
        const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

        // And we know the query will _always_ return a `due_date_status` of 'all populated', and the latest due date
        // to that of our return log.
        sendingResults[0].due_date_status = 'all populated'
        sendingResults[0].latest_due_date = setDueDateReturnLog.dueDate

        // Finally, in the case of returns reminders, the service will set the notificationDueDate for each recipient
        // to be the latest due date.
        sendingResults[0].notificationDueDate = setDueDateReturnLog.dueDate

        expect(results).toEqual(sendingResults)
      })
    })

    describe('and the query is for generating a download', () => {
      beforeAll(() => {
        download = true
      })

      it('fetches the correct recipient data for the download', async () => {
        const results = await FetchReturnsReminderRecipients(session, download)

        const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios.licenceHolder)

        downloadingResults[0].notificationDueDate = setDueDateReturnLog.dueDate

        expect(results).toEqual(downloadingResults)
      })
    })
  })

  describe('when the set up journey is "standard"', () => {
    beforeAll(() => {
      session = NoticeSessionFixture.standardReminder(scenarios.licenceHolder.licenceHolderRecipient.licenceRefs[0])
    })

    describe('and the query is NOT for generating a download', () => {
      beforeAll(() => {
        download = false
      })

      it('fetches the correct recipient data for sending the notice', async () => {
        const results = await FetchReturnsReminderRecipients(session, download)

        // NOTE: We know GenerateReturnLogsByPeriodQueryService when called for a returns reminder will generate a
        // query that will only fetch return logs with due dates. So, we know only the return log with the due date will
        // feature in the `return_log_ids` property of the result
        const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

        // And we know the query will _always_ return a `due_date_status` of 'all populated', and the latest due date
        // to that of our return log.
        sendingResults[0].due_date_status = 'all populated'
        sendingResults[0].latest_due_date = setDueDateReturnLog.dueDate

        // Finally, in the case of returns reminders, the service will set the notificationDueDate for each recipient
        // to be the latest due date.
        sendingResults[0].notificationDueDate = setDueDateReturnLog.dueDate

        expect(results).toEqual(sendingResults)
      })
    })

    describe('and the query is for generating a download', () => {
      beforeAll(() => {
        download = true
      })

      it('fetches the correct recipient data for the download', async () => {
        const results = await FetchReturnsReminderRecipients(session, download)

        const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios.licenceHolder)

        downloadingResults[0].notificationDueDate = setDueDateReturnLog.dueDate

        expect(results).toEqual(downloadingResults)
      })
    })
  })
})
