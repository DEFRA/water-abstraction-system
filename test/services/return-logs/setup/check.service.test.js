'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const CheckService = require('../../../../app/services/return-logs/setup/check.service.js')

describe('Return Logs Setup - Check service', () => {
  let sessionId

  before(async () => {
    const session = await SessionHelper.add({ data: { returnReference: '1234' } })
    sessionId = session.id
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CheckService.go(sessionId)

      expect(result).to.equal({
        activeNavBar: 'search',
        note: {
          actions: [
            {
              href: 'note',
              text: 'Add a note'
            }
          ],
          text: 'No notes added'
        },
        pageTitle: 'Check details and enter new volumes or readings',
        returnReference: '1234',
        sessionId
      })
    })
  })
})
