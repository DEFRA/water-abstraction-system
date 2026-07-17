// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import * as RecipientScenariosSeeder from '../../../../support/seeders/recipient-scenarios.seeder.js'
import NoticeSessionFixture from '../../../../support/fixtures/notice-session.fixture.js'
import ReturnLogHelper from '../../../../support/helpers/return-log.helper.js'
import { compareStrings } from '../../../../../app/lib/general.lib.js'
import { futureDueDate } from '../../../../../app/presenters/notices/base.presenter.js'
import { generateUUID } from '../../../../support/generators.js'

// Thing under test
import FetchReturnsInvitationRecipients from '../../../../../app/services/notices/setup/returns-notice/fetch-returns-invitation-recipients.service.js'

describe('Notices - Setup - Returns Notice - Fetch Returns Invitation Recipients service', () => {
  let download
  let nullDueDateReturnLog
  let session
  let setDueDateReturnLog
  let scenarios

  beforeAll(async () => {
    scenarios = {}

    // 1) Licence holder only
    // NOTE: GenerateRecipientsQueryService for downloads will order by return ID (it has to because of the distinct
    // clause). So, we generate two IDs, sort them, and then use them when creating the return logs to ensure our
    // expectations match the order of the results.
    const [nullDueDateReturnLogId, setDueDateReturnLogId] = [generateUUID(), generateUUID()].sort(compareStrings)

    // Create a return log with a null `dueDate`.
    nullDueDateReturnLog = await ReturnLogHelper.add({
      id: nullDueDateReturnLogId,
      dueDate: null,
      endDate: new Date('2025-03-01'),
      quarterly: false,
      startDate: new Date('2024-04-01')
    })

    // Create a return log with a populated `dueDate` for the same licence.
    setDueDateReturnLog = await ReturnLogHelper.add({
      id: setDueDateReturnLogId,
      dueDate: '2025-04-28',
      endDate: new Date('2025-03-01'),
      licenceRef: nullDueDateReturnLog.licenceRef,
      quarterly: false,
      startDate: new Date('2024-04-01')
    })

    scenarios.licenceHolder = await RecipientScenariosSeeder.licenceHolderOnly([
      nullDueDateReturnLog,
      setDueDateReturnLog
    ])
  })

  afterAll(async () => {
    await nullDueDateReturnLog.$query().delete()
    await setDueDateReturnLog.$query().delete()
    await RecipientScenariosSeeder.clean(scenarios)
  })

  describe('when the set up journey is "ad-hoc"', () => {
    beforeAll(() => {
      session = NoticeSessionFixture.adHocInvitation(scenarios.licenceHolder.licenceHolderRecipient.licenceRefs[0])
    })

    describe('and the query is NOT for generating a download', () => {
      beforeAll(() => {
        download = false
      })

      it('fetches the correct recipient data for sending the notice', async () => {
        const results = await FetchReturnsInvitationRecipients(session, download)

        // NOTE: We know GenerateReturnLogsByLicenceQueryService when called for a returns invitation will generate a
        // query that will fetch any due return logs
        const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

        // In our scenario we have a mix of return logs with and without due dates, so the query will return a
        // `due_date_status` of 'some nulls', but the latest due date will be set to that of setDueDateReturnLog
        sendingResults[0].due_date_status = 'some nulls'
        sendingResults[0].latest_due_date = setDueDateReturnLog.dueDate

        // Finally, in the case of returns invitations, the service will set the notificationDueDate for each recipient
        // based on the due date status. If there are any nulls, it will calculate the date (today + 28/29 days).
        sendingResults[0].notificationDueDate = futureDueDate('letter')

        expect(results).toEqual(sendingResults)
      })
    })

    describe('and the query is for generating a download', () => {
      beforeAll(() => {
        download = true
      })

      it('fetches the correct recipient data for the download', async () => {
        const results = await FetchReturnsInvitationRecipients(session, download)

        const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults(scenarios.licenceHolder)

        downloadingResults[0].due_date_status = 'some nulls'
        downloadingResults[0].latest_due_date = setDueDateReturnLog.dueDate
        downloadingResults[0].notificationDueDate = futureDueDate('letter')

        downloadingResults[1].due_date_status = 'some nulls'
        downloadingResults[1].notificationDueDate = futureDueDate('letter')

        expect(results).toEqual(downloadingResults)
      })
    })
  })

  describe('when the set up journey is "standard"', () => {
    beforeAll(() => {
      session = NoticeSessionFixture.standardInvitation(scenarios.licenceHolder.licenceHolderRecipient.licenceRefs[0])
    })

    describe('and the query is NOT for generating a download', () => {
      beforeAll(() => {
        download = false
      })

      it('fetches the correct recipient data for sending the notice', async () => {
        const results = await FetchReturnsInvitationRecipients(session, download)

        // NOTE: We know GenerateReturnLogsByPeriodQueryService when called for a returns invitation will generate a
        // query that will only fetch return logs without due dates. So, we know only the return log with a null due
        // date will feature in the `return_log_ids` property of the result
        const sendingResults = RecipientScenariosSeeder.transformToSendingResults(scenarios.licenceHolder)

        sendingResults[0].return_log_ids = [nullDueDateReturnLog.id]

        // And we know the query will _always_ return a `due_date_status` of 'all nulls', and the latest due date
        // will therefore be null.
        sendingResults[0].due_date_status = 'all nulls'
        sendingResults[0].latest_due_date = null

        // Because this is a standard notice, only return logs with null due dates will have been selected so it will
        // calculate the date (today + 28/29 days).
        sendingResults[0].notificationDueDate = futureDueDate('letter')

        expect(results).toEqual(sendingResults)
      })
    })

    describe('and the query is for generating a download', () => {
      beforeAll(() => {
        download = true
      })

      it('fetches the correct recipient data for the download', async () => {
        const results = await FetchReturnsInvitationRecipients(session, download)

        // NOTE: Standard invitations only fetch return logs with null due dates, so only nullDueDateReturnLog features
        const downloadingResults = RecipientScenariosSeeder.transformToDownloadingResults({
          licenceHolderRecipient: {
            ...scenarios.licenceHolder.licenceHolderRecipient,
            returnLogs: [nullDueDateReturnLog]
          }
        })

        downloadingResults[0].notificationDueDate = futureDueDate('letter')

        expect(results).toEqual(downloadingResults)
      })
    })
  })
})
