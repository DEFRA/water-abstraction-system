'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')
const UserSessionsFixture = require('../../../../support/fixtures/user-sessions.fixture.js')
const YarStub = require('../../../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitLicencesService = require('../../../../../app/services/users/external/setup/submit-licences.service.js')

describe('Users - External - Setup - Submit Licences Service', () => {
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = UserSessionsFixture.unregistrationSession()

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = YarStub.build(Sinon)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a valid payload', () => {
    beforeEach(() => {
      payload = { licences: 'all' }
    })

    it('saves the submitted value', async () => {
      await SubmitLicencesService.go(session.id, payload, yarStub)

      expect(session).toEqual({
        ...session,
        allLicences: true
      })
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitLicencesService.go(session.id, payload, yarStub)

      expect(result).toEqual({
        redirectUrl: `/system/users/external/setup/${session.id}/check`
      })
    })

    describe('and the check page has', () => {
      describe('been visited', () => {
        describe('and the "session" and "payload" value', () => {
          describe('match', () => {
            beforeEach(() => {
              session = SessionModelStub.build(Sinon, {
                ...sessionData,
                checkPageVisited: true,
                allLicences: true
              })

              fetchSessionStub.resolves(session)

              payload = { licences: 'all' }
            })

            it('does not set a notification', async () => {
              await SubmitLicencesService.go(session.id, payload, yarStub)

              expect(yarStub.flash.called).toBe(false)
            })
          })

          describe('do not match', () => {
            describe('because the user has changed from "All licences" to a specific one', () => {
              beforeEach(() => {
                session = SessionModelStub.build(Sinon, {
                  ...sessionData,
                  checkPageVisited: true,
                  allLicences: true
                })

                fetchSessionStub.resolves(session)

                payload = { licences: sessionData.licences[0].id }
              })

              it('sets a notification', async () => {
                await SubmitLicencesService.go(session.id, payload, yarStub)

                const [flashType, bannerMessage] = yarStub.flash.args[0]

                expect(flashType).toEqual('notification')
                expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Licences to unregister updated' })
              })
            })

            describe('because the user has changed the number of licences selected', () => {
              beforeEach(() => {
                session = SessionModelStub.build(Sinon, {
                  ...sessionData,
                  checkPageVisited: true,
                  allLicences: false,
                  selectedLicences: [sessionData.licences[0].id, sessionData.licences[1].id]
                })

                fetchSessionStub.resolves(session)

                payload = { licences: sessionData.licences[0].id }
              })

              it('sets a notification', async () => {
                await SubmitLicencesService.go(session.id, payload, yarStub)

                const [flashType, bannerMessage] = yarStub.flash.args[0]

                expect(flashType).toEqual('notification')
                expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Licences to unregister updated' })
              })
            })

            describe('because the user has changed the specific licences selected', () => {
              beforeEach(() => {
                session = SessionModelStub.build(Sinon, {
                  ...sessionData,
                  checkPageVisited: true,
                  allLicences: false,
                  selectedLicences: [sessionData.licences[1].id]
                })

                fetchSessionStub.resolves(session)

                payload = { licences: sessionData.licences[0].id }
              })

              it('sets a notification', async () => {
                await SubmitLicencesService.go(session.id, payload, yarStub)

                const [flashType, bannerMessage] = yarStub.flash.args[0]

                expect(flashType).toEqual('notification')
                expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Licences to unregister updated' })
              })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitLicencesService.go(session.id, payload, yarStub)

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
      const result = await SubmitLicencesService.go(session.id, payload, yarStub)

      expect(result).toEqual({
        error: {
          licences: {
            text: 'Select licences to unregister'
          },
          errorList: [
            {
              href: '#licences',
              text: 'Select licences to unregister'
            }
          ]
        },
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/external/${sessionData.user.id}/licences`,
          text: 'Back'
        },
        checkBoxItems: [
          {
            checked: false,
            hint: { text: session.licences[0].licenceVersions[0].company.name },
            text: session.licences[0].licenceRef,
            value: session.licences[0].id
          },
          {
            checked: false,
            hint: { text: session.licences[1].licenceVersions[0].company.name },
            text: session.licences[1].licenceRef,
            value: session.licences[1].id
          },
          {
            divider: 'or'
          },
          {
            behaviour: 'exclusive',
            checked: false,
            text: 'All licences',
            value: 'all'
          }
        ],
        pageTitle: 'Select licences to unregister',
        pageTitleCaption: sessionData.user.username,
        showHint: true
      })
    })
  })
})
