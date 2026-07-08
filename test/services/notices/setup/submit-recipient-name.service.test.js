'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')
const { generateNoticeReferenceCode } = require('../../../../app/lib/general.lib.js')

// Thing under test
const SubmitRecipientNameService = require('../../../../app/services/notices/setup/submit-recipient-name.service.js')

describe('Notices - Setup - Submit Recipient Name service', () => {
  let payload
  let referenceCode
  let session
  let sessionData

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode('RINV-')

    payload = { name: 'Ronald Weasley' }
    sessionData = {
      referenceCode
    }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitRecipientNameService(session.id, payload)

      expect(session).toEqual({
        ...session,
        contactName: 'Ronald Weasley'
      })

      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitRecipientNameService(session.id, payload)

      expect(result).toEqual({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitRecipientNameService(session.id, payload)

      expect(result).toEqual({
        activeNavBar: 'notices',
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
