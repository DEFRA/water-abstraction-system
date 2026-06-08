'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewLicencesService = require('../../../../app/services/company-contacts/setup/view-licences.service.js')

describe('Company Contacts - Setup - Licences Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewLicencesService.go(session.id)

      expect(result).to.equal({
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
          text: 'Back'
        },
        pageTitle: 'Select the licences they should get water abstraction alerts emails for'
      })
    })
  })
})
