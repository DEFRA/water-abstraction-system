'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitSelectRecipientsService = require('../../../../app/services/notices/setup/submit-select-recipients.service.js')

describe('Select Recipients Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = { recipients: ['123'] }
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitSelectRecipientsService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal(session)
    })

    it('continues the journey', async () => {
      const result = await SubmitSelectRecipientsService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = { recipients: [] }
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitSelectRecipientsService.go(session.id, payload)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/check`,
        error: {
          text: 'Select at least one recipient'
        },
        pageTitle: 'Select Recipients'
      })
    })
  })
})
