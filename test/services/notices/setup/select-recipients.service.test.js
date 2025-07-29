'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SelectRecipientsService = require('../../../../app/services/notices/setup/select-recipients.service.js')

describe('Select Recipients Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SelectRecipientsService.go(session.id)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/check`,
        pageTitle: 'Select Recipients'
      })
    })
  })
})
