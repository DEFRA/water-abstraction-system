// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import * as NoticeSessionFixture from '../../../../support/fixtures/notice-session.fixture.js'
import * as RecipientScenariosSeeder from '../../../../support/seeders/recipient-scenarios.seeder.js'
import ReturnLogHelper from '../../../../support/helpers/return-log.helper.js'

// Thing under test
import FetchPaperReturnsRecipientsService from '../../../../../app/services/notices/setup/returns-notice/fetch-paper-returns-recipients.service.js'

describe('Notices - Setup - Returns Notice - Fetch Paper Returns Recipients service', () => {
  let download
  let session
  let setDueDateReturnLog
  let scenarios

  beforeAll(async () => {
    scenarios = {}

    // 1) Licence holder only
    // Create a return log with a populated `dueDate`.
    setDueDateReturnLog = await ReturnLogHelper.add({ dueDate: new Date('2025-04-28') })

    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly([setDueDateReturnLog])

    session = NoticeSessionFixture.paperReturn(
      scenarios.licenceHolder.licenceHolderRecipient.licenceRefs[0],
      setDueDateReturnLog
    )
  })

  afterAll(async () => {
    await setDueDateReturnLog.$query().delete()

    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when service is called for sending or checking recipients', () => {
    beforeAll(() => {
      download = false
    })

    it('fetches the correct recipient data for sending the notice', async () => {
      const results = await FetchPaperReturnsRecipientsService(session, download)

      // NOTE: Unlike returns invitations and reminders, the notification due date is not determined for a paper return
      // until we generate the notification itself. This is because we send a notification per recipient and return log
      // combination, and the notification due date is determined based on the selected return log. So, the
      // PaperReturnNotificationsPresenter handles it. But the service sets it to null to return an object consistent
      // with FetchReturnsInvitationRecipients and FetchReturnsReminderRecipients.
      const sendingResult = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

      sendingResult[0].due_date_status = 'all populated'
      sendingResult[0].latest_due_date = setDueDateReturnLog.dueDate
      sendingResult[0].notificationDueDate = null

      expect(results).toEqual(sendingResult)
    })
  })

  describe('when the service is called for generating a download', () => {
    beforeAll(() => {
      download = true
    })

    it('fetches the correct recipient data for the download', async () => {
      const results = await FetchPaperReturnsRecipientsService(session, download)

      // NOTE: When fetching data for the download, the service _can_ determine the notification due date because each
      // row is distinct to a recipient and return log combination.
      const downloadingResult = RecipientScenariosSeeder.transformToDownloadingResults(scenarios.licenceHolder)

      downloadingResult[0].notificationDueDate = new Date('2025-04-28')

      expect(results).toEqual(downloadingResult)
    })
  })
})
