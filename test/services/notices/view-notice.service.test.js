'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateReferenceCode } = require('../../support/helpers/notification.helper.js')

// Things to stub
const FetchNoticeService = require('../../../app/services/notices/fetch-notice.service.js')

// Thing under test
const ViewNoticeService = require('../../../app/services/notices/view-notice.service.js')

describe('Notices - View Notice service', () => {
  let fetchResults
  let page
  let yarStub

  beforeEach(() => {
    const notice = {
      createdAt: new Date('2025-02-21T14:52:18.000Z'),
      id: 'a40dcb94-cb01-4fce-9a46-94b49eca2057',
      issuer: 'test@wrls.gov.uk',
      referenceCode: generateReferenceCode('WAA'),
      status: 'completed',
      subtype: 'waterAbstractionAlerts',
      alertType: 'warning',
      errorCount: 1,
      pendingCount: 0
    }

    const notifications = [
      {
        id: '2384d26f-5acb-4e3b-ab31-532197db095f',
        licences: ['01/123'],
        messageType: 'letter',
        notifyStatus: 'received',
        personalisation: {
          address_line_1: 'Clean Water Limited',
          address_line_2: 'c/o Bob Bobbles',
          address_line_3: 'Water Lane',
          address_line_4: 'Swampy Heath',
          address_line_5: 'CAMBRIDGESHIRE',
          address_line_6: 'CB23 1ZZ',
          alertType: 'warning',
          condition_text: 'Effect of restriction: 9.2 (ii) No abstraction shall take place when we say so',
          flow_or_level: 'flow',
          issuer_email_address: 'admin-internal@wrls.gov.uk',
          licence_ref: '01/123',
          licenceMonitoringStationId: 'b7cb48d1-7e23-49b8-9cee-686d302fdc48',
          name: 'Clean Water Limited',
          monitoring_station_name: 'FRENCHAY',
          source: '',
          threshold_unit: 'm3/s',
          threshold_value: 100
        },
        recipientName: null,
        status: 'sent'
      },
      {
        id: '93679656-03f5-4ad2-93eb-7c9b9b1b7b92',
        licences: ['01/124'],
        messageType: 'email',
        notifyStatus: 'permanent-failure',
        personalisation: {
          alertType: 'warning',
          condition_text: '',
          flow_or_level: 'flow',
          issuer_email_address: 'admin-internal@wrls.gov.uk',
          licence_ref: '01/124',
          licenceMonitoringStationId: '399d4483-a198-4fe5-b229-45e2fc2a57ec',
          monitoring_station_name: 'FRENCHAY',
          source: '',
          threshold_unit: 'm3/s',
          threshold_value: 100
        },
        recipientName: 'shaw.carol@atari.com',
        status: 'error'
      }
    ]

    fetchResults = { notice, notifications, totalNumber: 2 }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      page = 1

      // For the purposes of this tests the filter doesn't matter
      yarStub = { get: Sinon.stub().returns(_noticeFilters()) }

      Sinon.stub(FetchNoticeService, 'go').resolves(fetchResults)
    })

    it('returns page data for the view', async () => {
      const result = await ViewNoticeService.go(fetchResults.notice.id, yarStub, page)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: { href: '/system/notices', text: 'Go back to notices' },
        createdBy: 'test@wrls.gov.uk',
        dateCreated: '21 February 2025',
        filters: {
          licence: null,
          openFilter: false,
          recipient: null,
          status: null
        },
        notifications: [
          {
            recipient: [
              'Clean Water Limited',
              'c/o Bob Bobbles',
              'Water Lane',
              'Swampy Heath',
              'CAMBRIDGESHIRE',
              'CB23 1ZZ'
            ],
            licenceRefs: ['01/123'],
            messageType: 'letter',
            status: 'sent'
          },
          {
            recipient: ['shaw.carol@atari.com'],
            licenceRefs: ['01/124'],
            messageType: 'email',
            status: 'error'
          }
        ],
        numberShowing: 2,
        pageTitle: 'Warning alert',
        pageTitleCaption: `Notice ${fetchResults.notice.referenceCode}`,
        reference: fetchResults.notice.referenceCode,
        showingDeclaration: 'Showing all 2 notifications',
        status: 'error',
        pagination: {
          numberOfPages: 1
        },
        totalNumber: 2
      })
    })
  })

  describe('when the filters are assessed', () => {
    beforeEach(() => {
      Sinon.stub(FetchNoticeService, 'go').resolves(fetchResults)
    })

    describe('and none were ever set or they were cleared', () => {
      beforeEach(() => {
        yarStub = { get: Sinon.stub().returns(null) }
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await ViewNoticeService.go(fetchResults.notice.id, yarStub, page)

        expect(result.filters.openFilter).to.be.false()
      })
    })

    describe('and the filters were submitted empty', () => {
      beforeEach(() => {
        yarStub = { get: Sinon.stub().returns(_noticeFilters()) }
      })

      it('returns blank filters and that the controls should be closed', async () => {
        const result = await ViewNoticeService.go(fetchResults.notice.id, yarStub, page)

        expect(result.filters.openFilter).to.be.false()
      })
    })

    describe('when a filter was applied', () => {
      beforeEach(() => {
        const filters = _noticeFilters()

        filters.recipient = 'carol.shaw@wrls.gov.uk'
        yarStub = { get: Sinon.stub().returns(filters) }
      })

      it('returns the saved filters and that the controls should be open', async () => {
        const result = await ViewNoticeService.go(fetchResults.notice.id, yarStub, page)

        expect(result.filters.recipient).to.equal('carol.shaw@wrls.gov.uk')
        expect(result.filters.openFilter).to.be.true()
      })
    })
  })

  describe('when the page number is not provided', () => {
    beforeEach(() => {
      page = null

      // NOTE: We up the total number to force the paginator to calculate that there is more than one page. We can
      // then confirm page one was defaulted because it will appear in the title
      fetchResults.totalNumber = 150

      Sinon.stub(FetchNoticeService, 'go').resolves(fetchResults)
    })

    it('defaults to 1', async () => {
      const result = await ViewNoticeService.go(fetchResults.notice.id, yarStub, page)

      expect(result.pageTitle).to.equal('Warning alert (page 1 of 6)')
    })
  })
})

function _noticeFilters() {
  return {
    licence: null,
    recipient: null,
    status: null
  }
}
