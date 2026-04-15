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

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const ViewCheckNoticeTypeService = require('../../../../app/services/notices/setup/view-check-notice-type.service.js')

describe('Notices - Setup - View Check Notice Type service', () => {
  let licenceRef
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    licenceRef = generateLicenceRef()
    sessionData = { licenceRef, noticeType: 'invitations' }

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = { flash: Sinon.stub().resolves() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCheckNoticeTypeService.go(session.id, yarStub)

      expect(result).to.equal({
        activeNavBar: 'notices',
        licenceRef,
        links: {
          licenceNumber: `/system/notices/setup/${session.id}/licence`,
          noticeType: `/system/notices/setup/${session.id}/notice-type`,
          returns: `/system/notices/setup/${session.id}/paper-return`,
          returnsPeriod: `/system/notices/setup/${session.id}/returns-period`
        },
        notification: undefined,
        pageTitle: 'Check the notice type',
        returnNoticeType: 'Returns invitation',
        sessionId: session.id
      })
    })

    it('should set the "checkPageVisited" flag', async () => {
      await ViewCheckNoticeTypeService.go(session.id, yarStub)

      expect(session.checkPageVisited).to.be.true()
      expect(session.$update.called).to.be.true()
    })

    describe('when there is a notification', () => {
      beforeEach(() => {
        yarStub = { flash: Sinon.stub().returns(['Test notification']) }
      })

      it('should set the notification', async () => {
        const result = await ViewCheckNoticeTypeService.go(session.id, yarStub)

        expect(result.notification).to.equal('Test notification')
      })
    })
  })
})
