'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateNoticeReferenceCode } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewRecipientNameService = require('../../../../app/services/notices/setup/view-recipient-name.service.js')

describe('Notices - Setup - View Recipient Name service', () => {
  let referenceCode
  let session
  let sessionData

  beforeEach(() => {
    referenceCode = generateNoticeReferenceCode('RINV-')
    sessionData = { referenceCode }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewRecipientNameService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        name: undefined,
        pageTitle: "Enter the recipient's name",
        pageTitleCaption: `Notice ${referenceCode}`
      })
    })
  })
})
