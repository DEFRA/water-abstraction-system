'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitPaperReturnService = require('../../../../app/services/notices/setup/submit-paper-return.service.js')

describe('Notices - Setup - Submit Paper Return service', () => {
  let dueReturn
  let fetchSessionStub
  let licenceRef
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    licenceRef = generateLicenceRef()

    dueReturn = {
      siteDescription: 'Potable Water Supply - Direct',
      endDate: '2003-03-31',
      returnLogId: generateUUID(),
      returnReference: '3135',
      startDate: '2002-04-01'
    }

    payload = { returns: [dueReturn.returnLogId] }

    sessionData = { licenceRef }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the selected returns', async () => {
      await SubmitPaperReturnService.go(session.id, payload, yarStub)

      expect(session.selectedReturns).to.equal([dueReturn.returnLogId])
      expect(session.$update.called).to.be.true()
    })

    it('continues the journey', async () => {
      const result = await SubmitPaperReturnService.go(session.id, payload, yarStub)

      expect(result).to.equal({})
    })

    describe('and the payload has one item (is not an array)', () => {
      beforeEach(() => {
        payload = { returns: dueReturn.returnLogId }
        sessionData = {}

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the selected returns', async () => {
        await SubmitPaperReturnService.go(session.id, payload, yarStub)

        expect(session.selectedReturns).to.equal([dueReturn.returnLogId])
      })
    })

    describe('from the check page', () => {
      describe('and the returns have been updated', () => {
        beforeEach(() => {
          sessionData = { checkPageVisited: true, selectedReturns: [generateUUID()] }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('sets a flash message', async () => {
          await SubmitPaperReturnService.go(session.id, payload, yarStub)

          // Check we add the flash message
          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(bannerMessage).to.equal({
            text: 'Returns updated',
            titleText: 'Updated'
          })
        })
      })

      describe('and the returns have not been updated', () => {
        beforeEach(() => {
          sessionData = { checkPageVisited: true, selectedReturns: [dueReturn.returnLogId] }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        it('does not set a flash message', async () => {
          await SubmitPaperReturnService.go(session.id, payload, yarStub)

          expect(yarStub.flash.args[0]).to.be.undefined()
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}

      sessionData = { licenceRef, dueReturns: [dueReturn] }

      session = SessionModelStub.build(Sinon, sessionData)

      fetchSessionStub.resolves(session)
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitPaperReturnService.go(session.id, payload, yarStub)

      expect(result).to.equal({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/notice-type`,
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#returns',
              text: 'Select the returns for the paper return'
            }
          ],
          returns: {
            text: 'Select the returns for the paper return'
          }
        },
        pageTitle: 'Select the returns for the paper return',
        returns: [
          {
            checked: false,
            hint: {
              text: '1 April 2002 to 31 March 2003'
            },
            text: `${dueReturn.returnReference} Potable Water Supply - Direct`,
            value: dueReturn.returnLogId
          }
        ]
      })
    })

    describe('and there are already "selectedReturns"', () => {
      beforeEach(() => {
        sessionData = { licenceRef, dueReturns: [dueReturn], selectedReturns: [dueReturn.returnLogId] }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('returns page data for the view, with errors, and no options selected', async () => {
        const result = await SubmitPaperReturnService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          activeNavBar: 'notices',
          backLink: {
            href: `/system/notices/setup/${session.id}/notice-type`,
            text: 'Back'
          },
          error: {
            errorList: [
              {
                href: '#returns',
                text: 'Select the returns for the paper return'
              }
            ],
            returns: {
              text: 'Select the returns for the paper return'
            }
          },
          pageTitle: 'Select the returns for the paper return',
          returns: [
            {
              checked: false,
              hint: {
                text: '1 April 2002 to 31 March 2003'
              },
              text: `${dueReturn.returnReference} Potable Water Supply - Direct`,
              value: dueReturn.returnLogId
            }
          ]
        })
      })
    })
  })
})
