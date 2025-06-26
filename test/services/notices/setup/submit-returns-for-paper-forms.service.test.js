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
    payload = { returns: ['1'] }
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the selected returns', async () => {
      await SubmitReturnsForPaperFormsService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.returns).to.equal(['1'])
    })

    it('continues the journey', async () => {
      const result = await SubmitReturnsForPaperFormsService.go(session.id, payload)

      expect(result).to.equal({})
    })

    describe('and the payload has one item (is not an array)', () => {
      beforeEach(async () => {
        payload = { returns: '1' }
        sessionData = {}

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the selected returns', async () => {
        await SubmitReturnsForPaperFormsService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.returns).to.equal(['1'])
      })
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
          text: 'Select the returns for the paper forms'
        },

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
