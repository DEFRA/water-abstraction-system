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
  let returnLog
  let session

  before(async () => {
    licenceRef = generateLicenceRef()

    returnLog = await ReturnLogHelper.add({ dueDate: null, licenceRef })

    session = NoticeSessionFixture.paperReturn(licenceRef, returnLog)

    licenceHolder = await RecipientsSeeder.licenceHolder('Test Licence Holder', licenceRef)
    licenceHolder.licenceRefs = [licenceRef]
    licenceHolder.returnLogIds = [returnLog.returnId]
  })

  after(async () => {
    await returnLog.$query().delete()

    await RecipientsSeeder.clean(licenceHolder)
  })

  describe('when service is called for sending or checking recipients', () => {
    before(() => {
      download = false
    })

    it('fetches the correct recipient data for sending the notice', async () => {
      const results = await FetchPaperReturnsRecipientsService.go(session, download)

      const sendingResult = RecipientsSeeder.transformToSendingResult(licenceHolder)

      expect(results).to.equal([sendingResult])
    })
  })

  describe('when the service is called for generating a download', () => {
    before(() => {
      download = true
    })

    it('fetches the correct recipient data for the download', async () => {
      const results = await FetchPaperReturnsRecipientsService.go(session, download)

      const downloadingResult = RecipientsSeeder.transformToDownloadingResult(licenceHolder, returnLog)

      expect(results).to.equal([downloadingResult])
    })
  })
})
