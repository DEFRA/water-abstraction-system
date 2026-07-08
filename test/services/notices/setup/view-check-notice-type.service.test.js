'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Test helpers
const YarStub = require('../../../support/stubs/yar.stub.js')

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

    yarStub = YarStub.build(Sinon)
    yarStub.flash.resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCheckNoticeTypeService(session.id, yarStub)

      expect(result).toEqual({
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
        noticeType: 'Returns invitation',
        sessionId: session.id
      })
    })

    it('should set the "checkPageVisited" flag', async () => {
      await ViewCheckNoticeTypeService(session.id, yarStub)

      expect(session.checkPageVisited).toBe(true)
      expect(session.$update.called).toBe(true)
    })

    describe('when there is a notification', () => {
      beforeEach(() => {
        yarStub = YarStub.build(Sinon)
        yarStub.flash.returns(['Test notification'])
      })

      it('should set the notification', async () => {
        const result = await ViewCheckNoticeTypeService(session.id, yarStub)

        expect(result.notification).toEqual('Test notification')
      })
    })
  })
})
