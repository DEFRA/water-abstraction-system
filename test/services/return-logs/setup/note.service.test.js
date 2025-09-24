'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const NoteService = require('../../../../app/services/return-logs/setup/note.service.js')

describe('Return Logs Setup - Note service', () => {
  let sessionId

  beforeEach(async () => {
    const session = await SessionHelper.add({ data: { returnReference: '1234' } })
    sessionId = session.id
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await NoteService.go(sessionId)

      expect(result.sessionId).to.equal(sessionId)
    })

    it('returns page data for the view', async () => {
      const result = await NoteService.go(sessionId)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/return-logs/setup/${sessionId}/check`,
          text: 'Back'
        },
        note: null,
        pageTitle: 'Add a note',
        caption: 'Return reference 1234',
        sessionId
      })
    })
  })
})
