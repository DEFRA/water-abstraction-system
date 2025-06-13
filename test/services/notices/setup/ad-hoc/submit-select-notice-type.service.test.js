'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const SubmitSelectNoticeTypeService = require('../../../../../app/services/notices/setup/ad-hoc/submit-select-notice-type.service.js')

describe('Notices - Setup - Ad Hoc - Select Notice Type Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = { type: '' }
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitSelectNoticeTypeService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal(session)
    })

    it('continues the journey', async () => {
      const result = await SubmitSelectNoticeTypeService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitSelectNoticeTypeService.go(session.id, payload)

      expect(result).to.equal({
        pageTitle: 'Select the notice type',
        error: {
          text: 'Select the notice type'
        }
      })
    })
  })
})
