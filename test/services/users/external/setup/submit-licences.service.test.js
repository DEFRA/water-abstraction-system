'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../../support/helpers/licence.helper.js')

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
    sessionData = {
      activeNavBar: 'users',
      id: generateUUID(),
      licences: [
        {
          id: generateUUID(),
          licenceRef: generateLicenceRef(),
          licenceVersions: [
            {
              id: generateUUID(),
              issueDate: null,
              licenceId: generateUUID(),
              startDate: new Date('2022-04-01'),
              status: 'current',
              company: {
                id: generateUUID(),
                name: 'ACME Farms Ltd',
                type: 'organisation'
              }
            }
          ]
        }
      ],
      selectedLicences: [],
      user: {
        id: generateUUID(),
        licenceEntityId: generateUUID(),
        username: 'jon.lee@example.co.uk'
      }
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = { flash: Sinon.stub() }
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

      expect(session).to.equal({
        ...session,
        allLicences: true
      })
      expect(session.$update.called).to.be.true()
    })

    it('continues the journey', async () => {
      const result = await SubmitLicencesService.go(session.id, payload, yarStub)

      expect(result).to.equal({
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

              expect(yarStub.flash.called).to.be.false()
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

                expect(flashType).to.equal('notification')
                expect(bannerMessage).to.equal({ titleText: 'Updated', text: 'Licences to unregister updated' })
              })
            })

            describe('because the user has changed the number of licences selected', () => {
              beforeEach(() => {
                session = SessionModelStub.build(Sinon, {
                  ...sessionData,
                  checkPageVisited: true,
                  allLicences: false,
                  selectedLicences: [generateUUID(), generateUUID()]
                })

                fetchSessionStub.resolves(session)

                payload = { licences: sessionData.licences[0].id }
              })

              it('sets a notification', async () => {
                await SubmitLicencesService.go(session.id, payload, yarStub)

                const [flashType, bannerMessage] = yarStub.flash.args[0]

                expect(flashType).to.equal('notification')
                expect(bannerMessage).to.equal({ titleText: 'Updated', text: 'Licences to unregister updated' })
              })
            })

            describe('because the user has changed the specific licences selected', () => {
              beforeEach(() => {
                session = SessionModelStub.build(Sinon, {
                  ...sessionData,
                  checkPageVisited: true,
                  allLicences: false,
                  selectedLicences: [generateUUID()]
                })

                fetchSessionStub.resolves(session)

                payload = { licences: sessionData.licences[0].id }
              })

              it('sets a notification', async () => {
                await SubmitLicencesService.go(session.id, payload, yarStub)

                const [flashType, bannerMessage] = yarStub.flash.args[0]

                expect(flashType).to.equal('notification')
                expect(bannerMessage).to.equal({ titleText: 'Updated', text: 'Licences to unregister updated' })
              })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitLicencesService.go(session.id, payload, yarStub)

          expect(yarStub.flash.called).to.be.false()
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

      expect(result).to.equal({
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
          text: 'Go back to user'
        },
        checkBoxItems: [
          {
            checked: false,
            hint: { text: sessionData.licences[0].licenceVersions[0].company.name },
            text: sessionData.licences[0].licenceRef,
            value: sessionData.licences[0].id
          }
        ],
        pageTitle: 'Select licences to unregister',
        pageTitleCaption: sessionData.user.username,
        showHint: false
      })
    })
  })
})
