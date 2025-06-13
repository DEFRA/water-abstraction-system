'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const SelectNoticeTypeService = require('../../../../../app/services/notices/setup/ad-hoc/select-notice-type.service.js')

describe('Notices - Setup - Ad Hoc - Select Notice Type Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SelectNoticeTypeService.go(session.id)

      expect(result).to.equal({ pageTitle: 'Select the notice type' })
    })
  })
})
