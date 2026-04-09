'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const DeleteSessionDal = require('../../../../app/dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')
// Thing under test
const SubmitCancelService = require('../../../../app/services/company-contacts/setup/submit-cancel.service.js')

describe('Company Contacts - Setup - Cancel Service', () => {
  let company
  let fetchSessionStub
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    Sinon.stub(DeleteSessionDal, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('continues the journey', async () => {
      const result = await SubmitCancelService.go(session.id)

      expect(result).to.equal({
        redirectUrl: `/system/companies/${company.id}/contacts`
      })
    })

    it('clears the session', async () => {
      await SubmitCancelService.go(session.id)

      expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
    })

    describe('and the company contact is being edited', () => {
      beforeEach(async () => {
        sessionData.companyContact = { id: generateUUID() }

        session = SessionModelStub.build(Sinon, {
          ...sessionData,
          email: 'ERICE@TEST.COM'
        })

        fetchSessionStub.resolves(session)
      })

      it('continues the journey', async () => {
        const result = await SubmitCancelService.go(session.id)

        expect(result).to.equal({
          redirectUrl: `/system/company-contacts/${sessionData.companyContact.id}/contact-details`
        })
      })
    })
  })
})
