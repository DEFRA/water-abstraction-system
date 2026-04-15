'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitLicenceService = require('../../../../app/services/notices/setup/submit-licence.service.js')

describe('Notices - Setup - Submit Licence service', () => {
  let clock
  let fetchSessionStub
  let licenceRef
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    licenceRef = generateLicenceRef()

    clock = Sinon.useFakeTimers(new Date('2020-06-06'))

    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    clock.restore()
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        await LicenceHelper.add({ licenceRef })
        await ReturnLogHelper.add({ licenceRef, endDate: '2020-01-01' })

        payload = {
          licenceRef
        }
      })

      it('saves the submitted value', async () => {
        await SubmitLicenceService.go(session.id, payload, yarStub)

        expect(session.licenceRef).to.equal(licenceRef)
        expect(session.$update.called).to.be.true()
      })

      it('returns the redirect url', async () => {
        const result = await SubmitLicenceService.go(session.id, payload, yarStub)

        expect(result).to.equal({ redirectUrl: 'notice-type' })
      })

      describe('from the check page', () => {
        describe('and the licence ref has been updated', () => {
          beforeEach(() => {
            sessionData = { licenceRef: '01/11', checkPageVisited: true }

            session = SessionModelStub.build(Sinon, sessionData)

            fetchSessionStub.resolves(session)
          })

          it('redirects to the notice type page', async () => {
            const result = await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(result.redirectUrl).to.equal('notice-type')
          })

          it('updates the sessions "checkPageVisited" flag', async () => {
            await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(session.checkPageVisited).to.be.false()
          })

          it('sets a flash message', async () => {
            await SubmitLicenceService.go(session.id, payload, yarStub)

            // Check we add the flash message
            const [flashType, bannerMessage] = yarStub.flash.args[0]

            expect(flashType).to.equal('notification')
            expect(bannerMessage).to.equal({
              text: 'Licence number updated',
              titleText: 'Updated'
            })
          })
        })

        describe('and the licence ref has not been updated', () => {
          beforeEach(() => {
            sessionData = { licenceRef, checkPageVisited: true }

            session = SessionModelStub.build(Sinon, sessionData)

            fetchSessionStub.resolves(session)
          })

          it('redirects to the check notice type page', async () => {
            const result = await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(result.redirectUrl).to.equal('check-notice-type')
          })

          it('does not set a flash message', async () => {
            await SubmitLicenceService.go(session.id, payload, yarStub)

            expect(yarStub.flash.args[0]).to.be.undefined()
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not inputted anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitLicenceService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'notices',
            backLink: {
              href: '/system/notices',
              text: 'Back'
            },
            error: {
              errorList: [
                {
                  href: '#licenceRef',
                  text: 'Enter a licence number'
                }
              ],
              licenceRef: {
                text: 'Enter a licence number'
              }
            },
            licenceRef: null,
            pageTitle: 'Enter a licence number'
          })
        })
      })

      describe('because the user has entered a licence that does not exist', () => {
        beforeEach(() => {
          licenceRef = '1111'

          payload = {
            licenceRef
          }
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitLicenceService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'notices',
            backLink: {
              href: '/system/notices',
              text: 'Back'
            },
            error: {
              errorList: [
                {
                  href: '#licenceRef',
                  text: 'Enter a valid licence number'
                }
              ],
              licenceRef: {
                text: `Enter a valid licence number`
              }
            },
            licenceRef,
            pageTitle: 'Enter a licence number'
          })
        })
      })

      describe('because the user has entered a licence that has no due returns', () => {
        beforeEach(async () => {
          const licence = await LicenceHelper.add()

          licenceRef = licence.licenceRef

          payload = {
            licenceRef
          }
        })

        it('returns page data needed to re-render the view including the validation error', async () => {
          const result = await SubmitLicenceService.go(session.id, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'notices',
            backLink: {
              href: '/system/notices',
              text: 'Back'
            },
            error: {
              errorList: [
                {
                  href: '#licenceRef',
                  text: `There are no returns due for licence ${licenceRef}`
                }
              ],
              licenceRef: {
                text: `There are no returns due for licence ${licenceRef}`
              }
            },
            licenceRef,
            pageTitle: 'Enter a licence number'
          })
        })
      })
    })
  })
})
