'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const { NoticeJourney, NoticeType } = require('../../../../app/lib/static-lookups.lib.js')

// Things we need to stub
const FetchAbstractionAlertRecipientsService = require('../../../../app/services/notices/setup/abstraction-alerts/fetch-abstraction-alert-recipients.service.js')
const FetchAdHocReturnsRecipientsService = require('../../../../app/services/notices/setup/returns-notice/fetch-ad-hoc-returns-recipients.service.js')
const FetchPaperReturnsRecipientsService = require('../../../../app/services/notices/setup/returns-notice/fetch-paper-returns-recipients.service.js')
const FetchStandardReturnsRecipientsService = require('../../../../app/services/notices/setup/returns-notice/fetch-standard-returns-recipients.service.js')

// Thing under test
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')

describe('Notices - Setup - Fetch Recipients service', () => {
  let download
  let fetchAbstractionAlertRecipientsStub
  let fetchAdHocReturnsRecipientsStub
  let fetchPaperReturnsRecipientsStub
  let fetchStandardReturnsRecipientsStub
  let recipients
  let session

  afterEach(() => {
    Sinon.restore()
  })

  describe('when setting up an abstraction alert', () => {
    beforeEach(() => {
      session = {
        journey: NoticeJourney.ALERTS,
        noticeType: NoticeType.ABSTRACTION_ALERTS
      }

      download = false

      fetchAdHocReturnsRecipientsStub = Sinon.stub(FetchAdHocReturnsRecipientsService, 'go').resolves()
      fetchPaperReturnsRecipientsStub = Sinon.stub(FetchPaperReturnsRecipientsService, 'go').resolves()
      fetchStandardReturnsRecipientsStub = Sinon.stub(FetchStandardReturnsRecipientsService, 'go').resolves()
    })

    describe('and fetching recipients for checking or sending', () => {
      beforeEach(() => {
        recipients = [RecipientsFixture.alertNoticePrimaryUser(), RecipientsFixture.alertNoticeAdditionalContact()]

        fetchAbstractionAlertRecipientsStub = Sinon.stub(FetchAbstractionAlertRecipientsService, 'go').resolves(
          recipients
        )
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchAbstractionAlertRecipientsStub.calledOnceWith(session)).to.be.true()

        expect(fetchAdHocReturnsRecipientsStub.called).to.be.false()
        expect(fetchPaperReturnsRecipientsStub.called).to.be.false()
        expect(fetchStandardReturnsRecipientsStub.called).to.be.false()

        expect(results).to.equal(recipients)
      })
    })
  })

  describe('when setting up a paper return', () => {
    beforeEach(() => {
      session = {
        journey: NoticeJourney.ADHOC,
        noticeType: NoticeType.PAPER_RETURN
      }

      fetchAbstractionAlertRecipientsStub = Sinon.stub(FetchAbstractionAlertRecipientsService, 'go').resolves()
      fetchAdHocReturnsRecipientsStub = Sinon.stub(FetchAdHocReturnsRecipientsService, 'go').resolves()
      fetchStandardReturnsRecipientsStub = Sinon.stub(FetchStandardReturnsRecipientsService, 'go').resolves()
    })

    describe('and fetching recipients for checking or sending', () => {
      beforeEach(() => {
        download = false

        recipients = [
          RecipientsFixture.returnsNoticePrimaryUser(download),
          RecipientsFixture.returnsNoticeReturnsAgent(download)
        ]

        fetchPaperReturnsRecipientsStub = Sinon.stub(FetchPaperReturnsRecipientsService, 'go').resolves(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchPaperReturnsRecipientsStub.calledOnceWith(session, download)).to.be.true()

        expect(fetchAbstractionAlertRecipientsStub.called).to.be.false()
        expect(fetchAdHocReturnsRecipientsStub.called).to.be.false()
        expect(fetchStandardReturnsRecipientsStub.called).to.be.false()

        expect(results).to.equal(recipients)
      })
    })

    describe('and fetching recipients for downloading', () => {
      beforeEach(() => {
        download = true

        recipients = [
          RecipientsFixture.returnsNoticePrimaryUser(download),
          RecipientsFixture.returnsNoticeReturnsAgent(download)
        ]

        fetchPaperReturnsRecipientsStub = Sinon.stub(FetchPaperReturnsRecipientsService, 'go').resolves(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchPaperReturnsRecipientsStub.calledOnceWith(session, download)).to.be.true()

        expect(fetchAbstractionAlertRecipientsStub.called).to.be.false()
        expect(fetchAdHocReturnsRecipientsStub.called).to.be.false()
        expect(fetchStandardReturnsRecipientsStub.called).to.be.false()

        expect(results).to.equal(recipients)
      })
    })
  })

  describe('when setting up an ad-hoc returns invitation or reminder', () => {
    beforeEach(() => {
      session = {
        journey: NoticeJourney.ADHOC,
        noticeType: NoticeType.INVITATIONS
      }

      fetchAbstractionAlertRecipientsStub = Sinon.stub(FetchAbstractionAlertRecipientsService, 'go').resolves()
      fetchPaperReturnsRecipientsStub = Sinon.stub(FetchPaperReturnsRecipientsService, 'go').resolves()
      fetchStandardReturnsRecipientsStub = Sinon.stub(FetchStandardReturnsRecipientsService, 'go').resolves()
    })

    describe('and fetching recipients for checking or sending', () => {
      beforeEach(() => {
        download = false

        recipients = [
          RecipientsFixture.returnsNoticePrimaryUser(download),
          RecipientsFixture.returnsNoticeReturnsAgent(download)
        ]

        fetchAdHocReturnsRecipientsStub = Sinon.stub(FetchAdHocReturnsRecipientsService, 'go').resolves(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchAdHocReturnsRecipientsStub.calledOnceWith(session, download)).to.be.true()

        expect(fetchAbstractionAlertRecipientsStub.called).to.be.false()
        expect(fetchPaperReturnsRecipientsStub.called).to.be.false()
        expect(fetchStandardReturnsRecipientsStub.called).to.be.false()

        expect(results).to.equal(recipients)
      })
    })

    describe('and fetching recipients for downloading', () => {
      beforeEach(() => {
        download = true

        recipients = [
          RecipientsFixture.returnsNoticePrimaryUser(download),
          RecipientsFixture.returnsNoticeReturnsAgent(download)
        ]

        fetchAdHocReturnsRecipientsStub = Sinon.stub(FetchAdHocReturnsRecipientsService, 'go').resolves(recipients)
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchAdHocReturnsRecipientsStub.calledOnceWith(session, download)).to.be.true()

        expect(fetchAbstractionAlertRecipientsStub.called).to.be.false()
        expect(fetchPaperReturnsRecipientsStub.called).to.be.false()
        expect(fetchStandardReturnsRecipientsStub.called).to.be.false()

        expect(results).to.equal(recipients)
      })
    })
  })

  describe('when setting up a standard returns invitation or reminder', () => {
    beforeEach(() => {
      session = {
        journey: NoticeJourney.STANDARD,
        noticeType: NoticeType.REMINDERS
      }

      fetchAbstractionAlertRecipientsStub = Sinon.stub(FetchAbstractionAlertRecipientsService, 'go').resolves()
      fetchAdHocReturnsRecipientsStub = Sinon.stub(FetchAdHocReturnsRecipientsService, 'go').resolves()
      fetchPaperReturnsRecipientsStub = Sinon.stub(FetchPaperReturnsRecipientsService, 'go').resolves()
    })

    describe('and fetching recipients for checking or sending', () => {
      beforeEach(() => {
        download = false

        recipients = [
          RecipientsFixture.returnsNoticePrimaryUser(download),
          RecipientsFixture.returnsNoticeReturnsAgent(download)
        ]

        fetchStandardReturnsRecipientsStub = Sinon.stub(FetchStandardReturnsRecipientsService, 'go').resolves(
          recipients
        )
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchStandardReturnsRecipientsStub.calledOnceWith(session, download)).to.be.true()

        expect(fetchAbstractionAlertRecipientsStub.called).to.be.false()
        expect(fetchAdHocReturnsRecipientsStub.called).to.be.false()
        expect(fetchPaperReturnsRecipientsStub.called).to.be.false()

        expect(results).to.equal(recipients)
      })
    })

    describe('and fetching recipients for downloading', () => {
      beforeEach(() => {
        download = true

        recipients = [
          RecipientsFixture.returnsNoticePrimaryUser(download),
          RecipientsFixture.returnsNoticeReturnsAgent(download)
        ]

        fetchStandardReturnsRecipientsStub = Sinon.stub(FetchStandardReturnsRecipientsService, 'go').resolves(
          recipients
        )
      })

      it('determines the appropriate fetch service to call and returns the recipient data', async () => {
        const results = await FetchRecipientsService.go(session, download)

        expect(fetchStandardReturnsRecipientsStub.calledOnceWith(session, download)).to.be.true()

        expect(fetchAbstractionAlertRecipientsStub.called).to.be.false()
        expect(fetchAdHocReturnsRecipientsStub.called).to.be.false()
        expect(fetchPaperReturnsRecipientsStub.called).to.be.false()

        expect(results).to.equal(recipients)
      })
    })
  })
})
