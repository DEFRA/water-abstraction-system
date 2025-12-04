'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticeSessionFixture = require('../../../../fixtures/notice-session.fixture.js')
const RecipientsSeeder = require('../../../../support/seeders/recipients.seeder.js')
const ReturnLogHelper = require('../../../../support/helpers/return-log.helper.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

// Things we need to stub
const FeatureFlagsConfig = require('../../../../../config/feature-flags.config.js')

// Thing under test
const FetchAdHocReturnsRecipients = require('../../../../../app/services/notices/setup/returns-notice/fetch-ad-hoc-returns-recipients.service.js')

describe('Notices - Setup - Returns Notice - Fetch Ad-Hoc Returns Recipients service', () => {
  let download
  let licenceHolder
  let licenceRef
  let returnLogs
  let session

  beforeEach(() => {
    Sinon.stub(FeatureFlagsConfig, 'enableNullDueDate').value(true)
  })

  afterEach(() => {
    Sinon.restore()
  })

  before(async () => {
    licenceRef = generateLicenceRef()

    returnLogs = []

    let returnLog

    // Create a return log with a null `dueDate`.
    returnLog = await ReturnLogHelper.add({ dueDate: null, licenceRef })
    returnLogs.push(returnLog)

    // Create a return log with a populated `dueDate`.
    returnLog = await ReturnLogHelper.add({ dueDate: '2025-04-28', licenceRef })
    returnLogs.push(returnLog)

    licenceHolder = await RecipientsSeeder.licenceHolder('Test Licence Holder', licenceRef)
    licenceHolder.licenceRefs = [licenceRef]
    licenceHolder.returnLogIds = [returnLogs[0].returnId, returnLogs[1].returnId].sort()
  })

  after(async () => {
    for (const returnLog of returnLogs) {
      await returnLog.$query().delete()
    }

    await RecipientsSeeder.clean(licenceHolder)
  })

  describe('when the ad-hoc notice is a "returns invitation"', () => {
    before(() => {
      session = NoticeSessionFixture.adHocInvitation(licenceRef)
    })

    describe('and the query is NOT for generating a download', () => {
      before(() => {
        download = false
      })

      it('fetches the correct recipient data for sending the notice', async () => {
        const results = await FetchAdHocReturnsRecipients.go(session, download)

        const sendingResult = RecipientsSeeder.transformToSendingResult(licenceHolder)

        expect(results).to.equal([sendingResult])
      })
    })

    describe('and the query is for generating a download', () => {
      before(() => {
        download = true
      })

      it('fetches the correct recipient data for the download', async () => {
        const results = await FetchAdHocReturnsRecipients.go(session, download)

        // Because the results are ordered by licence ref then return reference, the actual order can change between
        // test runs because the values are all generated.
        // So, we skip adding a complex sort just for testing. Instead, we assert that the number of results is what we
        // expect, and that the results contain each result we expect. The outcome is the same.
        expect(results.length).to.equal(2)

        for (const returnLog of returnLogs) {
          const downloadingResult = RecipientsSeeder.transformToDownloadingResult(licenceHolder, returnLog)

          expect(results).to.contain(downloadingResult)
        }
      })
    })
  })

  describe('when the ad-hoc notice is a "returns reminder"', () => {
    before(() => {
      session = NoticeSessionFixture.adHocReminder(licenceRef)
    })

    describe('and the query is NOT for generating a download', () => {
      before(() => {
        download = false
      })

      it('fetches the correct recipient data for sending the notice', async () => {
        const results = await FetchAdHocReturnsRecipients.go(session, download)

        const sendingResult = RecipientsSeeder.transformToSendingResult(licenceHolder)

        expect(results).to.equal([sendingResult])
      })
    })

    describe('and the query is for generating a download', () => {
      before(() => {
        download = true
      })

      it('fetches the correct recipient data for the download', async () => {
        const results = await FetchAdHocReturnsRecipients.go(session, download)

        // Because the results are ordered by licence ref then return reference, the actual order can change between
        // test runs because the values are all generated.
        // So, we skip adding a complex sort just for testing. Instead, we assert that the number of results is what we
        // expect, and that the results contain each result we expect. The outcome is the same.
        expect(results.length).to.equal(2)

        for (const returnLog of returnLogs) {
          const downloadingResult = RecipientsSeeder.transformToDownloadingResult(licenceHolder, returnLog)

          expect(results).to.contain(downloadingResult)
        }
      })
    })
  })
})
