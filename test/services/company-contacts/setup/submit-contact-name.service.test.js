'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const YarStub = require('../../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitContactNameService = require('../../../../app/services/company-contacts/setup/submit-contact-name.service.js')

describe('Company Contacts - Setup - Contact Name Service', () => {
  let company
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    company = CustomersFixtures.company()

    sessionData = { company }

    payload = { name: 'Eric' }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = YarStub.build(Sinon)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitContactNameService(session.id, payload, yarStub)

      expect(session).toEqual({
        ...session,
        name: 'Eric'
      })
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitContactNameService(session.id, payload, yarStub)

      expect(result).toEqual({
        redirectUrl: `/system/company-contacts/setup/${session.id}/contact-email`
      })
    })

    describe('when the check page has', () => {
      describe('been visited', () => {
        beforeEach(() => {
          session = SessionModelStub.build(Sinon, {
            ...sessionData,
            checkPageVisited: true,
            name: 'Eric'
          })

          fetchSessionStub.resolves(session)
        })

        describe('and the "session" and "payload" value', () => {
          describe('match', () => {
            it('does not set a notification', async () => {
              await SubmitContactNameService(session.id, payload, yarStub)

              expect(yarStub.flash.called).toBe(false)
            })
          })

          describe('do not match', () => {
            beforeEach(() => {
              payload = { name: 'Bob' }
            })

            it('sets a notification', async () => {
              await SubmitContactNameService(session.id, payload, yarStub)

              const [flashType, bannerMessage] = yarStub.flash.args[0]

              expect(flashType).toEqual('notification')
              expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Name updated' })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitContactNameService(session.id, payload, yarStub)

          expect(yarStub.flash.called).toBe(false)
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitContactNameService(session.id, payload, yarStub)

      expect(result).toEqual({
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#name',
              text: 'Enter a name for the contact'
            }
          ],
          name: {
            text: 'Enter a name for the contact'
          }
        },
        name: '',
        pageTitle: 'Enter a name for the contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
