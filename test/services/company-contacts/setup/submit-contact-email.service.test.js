'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitContactEmailService = require('../../../../app/services/company-contacts/setup/submit-contact-email.service.js')

describe('Company Contacts - Setup - Contact Email Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = { email: 'test@test.com' }
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitContactEmailService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal(session)
    })

    it('continues the journey', async () => {
      const result = await SubmitContactEmailService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitContactEmailService.go(session.id, payload)

      expect(result).to.equal({
        activeNavBar: '',
        backLink: {
          href: '',
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#email',
              text: '"email" is required'
            }
          ],
          email: {
            text: '"email" is required'
          }
        },
        pageTitle: ''
      })
    })
  })
})
