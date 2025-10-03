'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const StandardService = require('../../../../app/services/notices/setup/standard.service.js')

describe('Standard Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await StandardService.go(session.id)

      expect(result).to.equal({
        backLink: {
          href: '/system/notices',
          text: 'Back'
        },
        pageTitle: 'Select a notice type',
        radioOptions: [
          {
            text: 'Invitations',
            value: 'invitations'
          },
          {
            text: 'Reminders',
            value: 'reminders'
          }
        ]
      })
    })
  })
})
