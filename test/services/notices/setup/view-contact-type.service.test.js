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
const ViewContactTypeService = require('../../../../app/services/notices/setup/view-contact-type.service.js')

describe('Notices - Setup - View Contact Type service', () => {
  let session
  let sessionData

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with no saved data', () => {
    beforeEach(() => {
      sessionData = { referenceCode: 'RINV-CPFRQ4' }

      session = SessionModelStub.build(Sinon, sessionData)

      Sinon.stub(FetchSessionDal, 'go').resolves(session)
    })

    it('returns page data for the view', async () => {
      const result = await ViewContactTypeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        contactEmail: null,
        contactName: null,
        contactType: null,
        pageTitle: 'Select how to contact the recipient',
        pageTitleCaption: 'Notice RINV-CPFRQ4'
      })
    })
  })

  describe('when called with a saved name', () => {
    beforeEach(() => {
      sessionData = {
        contactName: 'Fake Person',
        contactType: 'post',
        referenceCode: 'RINV-CPFRQ4'
      }

      session = SessionModelStub.build(Sinon, sessionData)

      Sinon.stub(FetchSessionDal, 'go').resolves(session)
    })

    it('returns page data for the view', async () => {
      const result = await ViewContactTypeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        contactEmail: null,
        contactName: 'Fake Person',
        contactType: 'post',
        pageTitle: 'Select how to contact the recipient',
        pageTitleCaption: 'Notice RINV-CPFRQ4'
      })
    })
  })

  describe('when called with a saved email', () => {
    beforeEach(() => {
      sessionData = {
        contactEmail: 'fake@person.com',
        contactType: 'email',
        referenceCode: 'RINV-CPFRQ4'
      }

      session = SessionModelStub.build(Sinon, sessionData)

      Sinon.stub(FetchSessionDal, 'go').resolves(session)
    })

    it('returns page data for the view', async () => {
      const result = await ViewContactTypeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        contactEmail: 'fake@person.com',
        contactName: null,
        contactType: 'email',
        pageTitle: 'Select how to contact the recipient',
        pageTitleCaption: 'Notice RINV-CPFRQ4'
      })
    })
  })
})
