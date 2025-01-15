'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers

// Thing under test
const RecipientsService = require('../../../../app/services/notifications/setup/recipients.service.js')
const LicenceDocumentHeaderHelper = require('../../../support/helpers/licence-document-header.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')

describe('Notifications Setup - Recipients service', () => {
  let dueDate
  let isSummer
  let page
  let licenceDocumentHeader, returnLog

  beforeEach(async () => {
    dueDate = '2023-04-28' // matches return log date
    isSummer = 'false'
    page = 1

    returnLog = await ReturnLogHelper.add()

    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      licenceName: 'Licence Holder Ltd',
      licenceRef: returnLog.licenceRef
    })
  })

  describe('when provided no params', () => {
    it('correctly presents the data', async () => {
      const result = await RecipientsService.go(dueDate, isSummer, page)

      expect(result).to.equal(['something'])
    })
  })
})
