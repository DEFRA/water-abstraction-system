'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsSeeder = require('../../../../support/seeders/recipients.seeder.js')
const ReturnLogHelper = require('../../../../support/helpers/return-log.helper.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

// Thing under test
const FetchAlternateReturnsRecipients = require('../../../../../app/services/notices/setup/returns-notice/fetch-alternate-returns-recipients.service.js')

describe('Notices - Setup - Returns Notice - Fetch Alternate Returns Recipients service', () => {
  const notificationDueDate = new Date('2025-12-24')

  let licenceHolder
  let licenceRef
  let returnLog

  before(async () => {
    licenceRef = generateLicenceRef()

    returnLog = await ReturnLogHelper.add({ dueDate: null, licenceRef })

    licenceHolder = await RecipientsSeeder.licenceHolder('Test Licence Holder', licenceRef)
    licenceHolder.licenceRefs = [licenceRef]
    licenceHolder.returnLogIds = [returnLog.id]
  })

  after(async () => {
    await returnLog.$query().delete()

    await RecipientsSeeder.clean(licenceHolder)
  })

  describe('when service is called for sending the "alternate notice"', () => {
    it('fetches the correct recipient data for sending the notice', async () => {
      const results = await FetchAlternateReturnsRecipients.go([returnLog.id], notificationDueDate)

      const sendingResult = RecipientsSeeder.transformToSendingResult(licenceHolder)
      sendingResult.notificationDueDate = notificationDueDate

      expect(results).to.equal([sendingResult])
    })
  })
})
