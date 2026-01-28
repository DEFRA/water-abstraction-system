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
const { futureDueDate } = require('../../../../../app/presenters/notices/base.presenter.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

// Thing under test
const FetchReturnsInvitationRecipients = require('../../../../../app/services/notices/setup/returns-notice/fetch-returns-invitation-recipients.service.js')

describe('Notices - Setup - Returns Notice - Fetch Returns Invitation Recipients service', () => {
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
      id: returnLogIds[0],
      dueDate: null,
      endDate: new Date('2025-03-01'),
      licenceRef,
      quarterly: false,
      startDate: new Date('2024-04-01')
    })

    // Create a return log with a populated `dueDate`.
    setDueDateReturnLog = await ReturnLogHelper.add({
      id: returnLogIds[1],
      dueDate: '2025-04-28',
      endDate: new Date('2025-03-01'),
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
      session = NoticeSessionFixture.adHocInvitation(licenceRef)
    })

    describe('and the query is NOT for generating a download', () => {
      before(() => {
        download = false
      })

      it('fetches the correct recipient data for sending the notice', async () => {
        const results = await FetchReturnsInvitationRecipients.go(session, download)

        // NOTE: We know GenerateReturnLogsByLicenceQueryService when called for a returns invitation will generate a
        // query that will fetch any due return logs
        const sendingResult = RecipientsSeeder.transformToSendingResult({
          ...licenceHolder,
          returnLogIds: [nullDueDateReturnLog.id, setDueDateReturnLog.id].sort()
        })

        // In our scenario we have a mix of return logs with and without due dates, so the query will return a
        // `due_date_status` of 'some nulls', but the latest due date will be set to that of setDueDateReturnLog
        sendingResult.due_date_status = 'some nulls'
        sendingResult.latest_due_date = setDueDateReturnLog.dueDate

        // Finally, in the case of returns invitations, the service will set the notificationDueDate for each recipient
        // based on the due date status. If there are any nulls, it will calculate the date (today + 28/29 days).
        sendingResult.notificationDueDate = futureDueDate('letter')

        expect(results).to.equal([sendingResult])
      })
    })

    describe('and the query is for generating a download', () => {
      before(() => {
        download = true
      })

      it('fetches the correct recipient data for the download', async () => {
        const results = await FetchReturnsInvitationRecipients.go(session, download)

        const downloadingResult1 = RecipientsSeeder.transformToDownloadingResult(licenceHolder, nullDueDateReturnLog)

        downloadingResult1.due_date_status = 'some nulls'
        downloadingResult1.latest_due_date = setDueDateReturnLog.dueDate
        downloadingResult1.notificationDueDate = futureDueDate('letter')

        const downloadingResult2 = RecipientsSeeder.transformToDownloadingResult(licenceHolder, setDueDateReturnLog)

        downloadingResult2.due_date_status = 'some nulls'
        downloadingResult2.notificationDueDate = futureDueDate('letter')

        expect(results).to.equal([downloadingResult1, downloadingResult2])
      })
    })
  })

  describe('when the set up journey is "standard"', () => {
    before(() => {
      session = NoticeSessionFixture.standardInvitation(licenceRef)
    })

    describe('and the query is NOT for generating a download', () => {
      before(() => {
        download = false
      })

      it('fetches the correct recipient data for sending the notice', async () => {
        const results = await FetchReturnsInvitationRecipients.go(session, download)

        // NOTE: We know GenerateReturnLogsByPeriodQueryService when called for a returns invitation will generate a
        // query that will only fetch return logs without due dates. So, we know only the return log with a null due
        // date will feature in the `return_log_ids` property of the result
        const sendingResult = RecipientsSeeder.transformToSendingResult({
          ...licenceHolder,
          returnLogIds: [nullDueDateReturnLog.id]
        })

        // And we know the query will _always_ return a `due_date_status` of 'all nulls', and the latest due date
        // will therefore be null.
        sendingResult.due_date_status = 'all nulls'
        sendingResult.latest_due_date = null

        // Because this is a standard notice, only return logs with null due dates will have been selected so it will
        // calculate the date (today + 28/29 days).
        sendingResult.notificationDueDate = futureDueDate('letter')

        expect(results).to.equal([sendingResult])
      })
    })

    describe('and the query is for generating a download', () => {
      before(() => {
        download = true
      })

      it('fetches the correct recipient data for the download', async () => {
        const results = await FetchReturnsInvitationRecipients.go(session, download)

        const downloadingResult = RecipientsSeeder.transformToDownloadingResult(licenceHolder, nullDueDateReturnLog)

        downloadingResult.notificationDueDate = futureDueDate('letter')

        expect(results).to.equal([downloadingResult])
      })
    })
  })
})
