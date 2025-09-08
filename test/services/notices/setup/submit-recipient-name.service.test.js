'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Thing under test
const SubmitRecipientNameService = require('../../../../app/services/notices/setup/submit-recipient-name.service.js')

describe('Notices - Setup - Recipient Name Service', () => {
  let payload
  let referenceCode
  let session
  let sessionData

  beforeEach(async () => {
    referenceCode = generateReferenceCode()

    payload = { name: 'Ronald Weasley' }
    sessionData = {
      referenceCode
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
          contactName: 'Ronald Weasley',
          referenceCode
        },
        contactName: 'Ronald Weasley'
      })
    })

    it('saves the submitted value', async () => {
      await SubmitRecipientNameService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.contactName).to.equal('Ronald Weasley')
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
        activeNavBar: 'manage',
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#name',
              text: "Enter the recipient's name"
            }
          ],
          name: {
            text: "Enter the recipient's name"
          }
        },

        name: undefined,
        pageTitle: "Enter the recipient's name",
        pageTitleCaption: `Notice ${referenceCode}`
      })
    })
  })
})
