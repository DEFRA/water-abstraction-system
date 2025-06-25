'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitReturnsForPaperFormsService = require('../../../../app/services/notices/setup/submit-returns-for-paper-forms.service.js')

describe('Returns For Paper Forms Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = { returns: [] }
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitReturnsForPaperFormsService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal(session)
    })

    it('continues the journey', async () => {
      const result = await SubmitReturnsForPaperFormsService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitReturnsForPaperFormsService.go(session.id, payload)

      expect(result).to.equal({
        error: {
          text: '"returns" is required'
        },
        pageTile: 'Select the returns for the paper forms'
      })
    })
  })
})
