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
const FetchStandardReturnsRecipients = require('../../../../../app/services/notices/setup/returns-notice/fetch-standard-returns-recipients.service.js')

describe('Notices - Setup - Returns Notice - Fetch Standard Returns Recipients service', () => {
  let download
  let licenceHolder
  let licenceRef
  let nullDueDateReturnLog
  let session
  let setDueDateReturnLog

  before(async () => {
    licenceRef = generateLicenceRef()

    // Create a return log with a null `dueDate`.
    nullDueDateReturnLog = await ReturnLogHelper.add({
      dueDate: null,
      endDate: new Date('2025-03-01'),
      licenceRef,
      quarterly: false,
      startDate: new Date('2024-04-01')
    })

    // Create a return log with a populated `dueDate`.
    setDueDateReturnLog = await ReturnLogHelper.add({
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

  describe('when the standard notice is a "returns invitation"', () => {
    before(() => {
      session = NoticeSessionFixture.standardInvitation(licenceRef)
    })

    describe('and the query is NOT for generating a download', () => {
      before(() => {
        download = false
      })

      it('fetches the correct recipient data for sending the notice', async () => {
        const results = await FetchStandardReturnsRecipients.go(session, download)

        // NOTE: The return log IDs assigned to the recipient will be dependent on the due_return_logs query used. This
        // changes based on the notice type. So, for invitations, only the first return log (with null due date) is
        // included.
        const sendingResult = RecipientsSeeder.transformToSendingResult({
          ...licenceHolder,
          returnLogIds: [nullDueDateReturnLog.returnId]
        })

        expect(results).to.equal([sendingResult])
      })
    })

    describe('and the query is for generating a download', () => {
      before(() => {
        download = true
      })

      it('fetches the correct recipient data for the download', async () => {
        const results = await FetchStandardReturnsRecipients.go(session, download)

        const downloadingResult = RecipientsSeeder.transformToDownloadingResult(
          { ...licenceHolder, returnLogIds: [nullDueDateReturnLog.returnId] },
          nullDueDateReturnLog
        )

        expect(results).to.equal([downloadingResult])
      })
    })
  })

  describe('when the standard notice is a "returns reminder"', () => {
    before(() => {
      session = NoticeSessionFixture.standardReminder(licenceRef)
    })

    describe('and the query is NOT for generating a download', () => {
      before(() => {
        download = false
      })

      it('fetches the correct recipient data for sending the notice', async () => {
        const results = await FetchStandardReturnsRecipients.go(session, download)

        // NOTE: The return log IDs assigned to the recipient will be dependent on the due_return_logs query used. This
        // changes based on the notice type. So, for reminders, only the second return log (with a set due date) is
        // included.
        const sendingResult = RecipientsSeeder.transformToSendingResult({
          ...licenceHolder,
          returnLogIds: [setDueDateReturnLog.returnId]
        })

        expect(results).to.equal([sendingResult])
      })
    })

    describe('and the query is for generating a download', () => {
      before(() => {
        download = true
      })

      it('fetches the correct recipient data for the download', async () => {
        const results = await FetchStandardReturnsRecipients.go(session, download)

        const downloadingResult = RecipientsSeeder.transformToDownloadingResult(
          { ...licenceHolder, returnLogIds: [setDueDateReturnLog.returnId] },
          setDueDateReturnLog
        )

        expect(results).to.equal([downloadingResult])
      })
    })
  })
})
