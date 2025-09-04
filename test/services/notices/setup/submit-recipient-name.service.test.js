'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitRecipientNameService = require('../../../../app/services/notices/setup/submit-recipient-name.service.js')

describe('Notices - Setup - Recipient Name Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = { name: 'Ronald Weasley' }
    sessionData = {
      address: {}
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitRecipientNameService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal({
        ...session,
        data: {
          address: {
            backLink: {
              href: `/system/notices/setup/${session.id}/recipient-name`,
              text: 'Back'
            }
          },
          contactName: 'Ronald Weasley'
        },
        address: {
          backLink: {
            href: `/system/notices/setup/${session.id}/recipient-name`,
            text: 'Back'
          }
        },
        contactName: 'Ronald Weasley'
      })
    })

    it('saves the submitted value', async () => {
      await SubmitRecipientNameService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.contactName).to.equal('Ronald Weasley')
    })

    it('saves the back link', async () => {
      await SubmitRecipientNameService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.address.backLink).to.equal({
        href: `/system/notices/setup/${session.id}/recipient-name`,
        text: 'Back'
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitRecipientNameService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitRecipientNameService.go(session.id, payload)

      expect(result).to.equal({
        backLink: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Back'
        },
        error: {
          href: '#name',
          text: "Enter the recipient's name"
        },
        name: undefined,
        pageTitle: "Enter the recipient's name"
      })
    })
  })
})
