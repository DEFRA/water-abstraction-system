'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Thing under test
const RecipientNameService = require('../../../../app/services/notices/setup/recipient-name.service.js')

describe('Notices - Setup - Recipient Name Service', () => {
  let referenceCode
  let session
  let sessionData

  beforeEach(async () => {
    referenceCode = generateReferenceCode()
    sessionData = { referenceCode }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await RecipientNameService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        name: undefined,
        pageTitle: "Enter the recipient's name",
        pageTitleCaption: `Notice ${referenceCode}`
      })
    })
  })
})
