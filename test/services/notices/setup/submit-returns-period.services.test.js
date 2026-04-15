'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, after, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateNoticeReferenceCode } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitReturnsPeriodService = require('../../../../app/services/notices/setup/submit-returns-period.service.js')

describe('Notices - Setup - Submit Returns Period service', () => {
  let clock
  let fetchSessionStub
  let payload
  let referenceCode
  let session
  let sessionData
  let yarStub

  before(() => {
    referenceCode = generateNoticeReferenceCode('RINV-')

    const testDate = new Date('2024-12-01')

    clock = Sinon.useFakeTimers(testDate)

    yarStub = { flash: Sinon.stub() }
  })

  beforeEach(() => {
    sessionData = { referenceCode, noticeType: 'invitations' }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)
  })

  after(() => {
    clock.restore()
  })

  afterEach(() => {
    fetchSessionStub.restore()
  })

  describe('when submitting as returns period ', () => {
    describe('is successful', () => {
      beforeEach(() => {
        payload = { returnsPeriod: 'quarterFour' }
      })

      it('saves the submitted value', async () => {
        await SubmitReturnsPeriodService.go(session.id, payload, yarStub)

        expect(session.returnsPeriod).to.equal('quarterFour')
        expect(session.$update.called).to.be.true()
      })

      it('saves the determined returns period', async () => {
        await SubmitReturnsPeriodService.go(session.id, payload, yarStub)

        expect(session.determinedReturnsPeriod).to.equal({
          // The dates would be strings and not date objects when saved to the database
          dueDate: new Date('2025-04-28'),
          endDate: new Date('2025-03-31'),
          name: 'quarterFour',
          startDate: new Date('2025-01-01'),
          summer: 'false',
          quarterly: true
        })
      })

      it('returns the redirect route', async () => {
        const result = await SubmitReturnsPeriodService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          redirect: `${session.id}/check-notice-type`
        })
      })
    })

    describe('and the user comes from the check page', () => {
      beforeEach(() => {
        sessionData = { referenceCode, noticeType: 'invitations', checkPageVisited: true }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('sets a flash message', async () => {
        await SubmitReturnsPeriodService.go(session.id, payload, yarStub)

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(bannerMessage).to.equal({
          text: 'Returns period updated',
          titleText: 'Updated'
        })
      })
    })

    describe('fails validation', () => {
      beforeEach(() => {
        sessionData = { referenceCode, journey: 'invitations', noticeType: 'invitations' }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)

        payload = {}
      })

      it('correctly presents the data with the error', async () => {
        const result = await SubmitReturnsPeriodService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          activeNavBar: 'notices',
          backLink: {
            href: `/system/notices/setup/${session.id}/notice-type`,
            text: 'Back'
          },
          error: {
            errorList: [
              {
                href: '#returnsPeriod',
                text: 'Select the returns periods for the invitations'
              }
            ],
            returnsPeriod: {
              text: 'Select the returns periods for the invitations'
            }
          },
          pageTitle: 'Select the returns periods for the invitations',
          returnsPeriod: [
            {
              checked: false,
              hint: {
                text: 'Due date 28 January 2025'
              },
              text: 'Quarterly 1 October 2024 to 31 December 2024',
              value: 'quarterThree'
            },
            {
              checked: false,
              hint: {
                text: 'Due date 28 April 2025'
              },
              text: 'Quarterly 1 January 2025 to 31 March 2025',
              value: 'quarterFour'
            }
          ]
        })
      })
    })
  })
})
