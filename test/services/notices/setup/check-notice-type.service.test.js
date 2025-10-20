'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Thing under test
const CheckNoticeTypeService = require('../../../../app/services/notices/setup/check-notice-type.service.js')

describe('Notices - Setup - Check Notice Type Service', () => {
  let licenceRef
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    licenceRef = generateLicenceRef()
    sessionData = { licenceRef, noticeType: 'invitations' }

    session = await SessionHelper.add({ data: sessionData })

    yarStub = { flash: Sinon.stub().resolves() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await CheckNoticeTypeService.go(session.id, yarStub)

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
      await CheckNoticeTypeService.go(session.id, yarStub)

      const refreshedSession = await session.$query()

      expect(refreshedSession.checkPageVisited).to.be.true()
    })

    describe('when there is a notification', () => {
      beforeEach(() => {
        yarStub = { flash: Sinon.stub().returns(['Test notification']) }
      })

      it('should set the notification', async () => {
        const result = await CheckNoticeTypeService.go(session.id, yarStub)

        expect(result.notification).to.equal('Test notification')
      })
    })
  })
})
