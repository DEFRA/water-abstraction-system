'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ReturnsForPaperFormsService = require('../../../../app/services/notices/setup/returns-for-paper-forms.service.js')

describe('Returns For Paper Forms Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ReturnsForPaperFormsService.go(session.id)

      expect(result).to.equal({
        pageTitle: 'Select the returns for the paper forms',
        returns: [
          {
            checked: false,
            hint: {
              text: '1 January 2025 to 1 January 2026'
            },
            text: '1 Potable Water Supply - Direct',
            value: '1'
          },
          {
            checked: false,
            hint: {
              text: '1 January 2025 to 1 January 2026'
            },
            text: '2 Potable Water Supply - Direct',
            value: '2'
          }
        ]
      })
    })
  })
})
