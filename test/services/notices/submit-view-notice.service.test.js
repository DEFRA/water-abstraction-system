'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateReferenceCode } = require('../../support/helpers/notification.helper.js')

// Things to stub
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const FetchNoticeService = require('../../../app/services/notices/fetch-notice.service.js')

// Thing under test
const SubmitViewNoticeService = require('../../../app/services/notices/submit-view-notice.service.js')

describe('Notices - Submit View Notice service', () => {
  const noticeId = 'ed9e8145-8f2b-4561-b200-d3ee95d30938'

  let notice
  let notifications
  let payload
  let yarStub

  beforeEach(async () => {
    Sinon.stub(FeatureFlagsConfig, 'enableSystemNoticeView').value(true)

    notice = {
      createdAt: new Date('2025-02-21T14:52:18.000Z'),
      id: 'a40dcb94-cb01-4fce-9a46-94b49eca2057',
      issuer: 'test@wrls.gov.uk',
      overallStatus: 'error',
      referenceCode: generateReferenceCode('WAA'),
      status: 'completed',
      subtype: 'waterAbstractionAlerts',
      alertType: 'warning'
    }

    notifications = [
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

    yarStub = {
      clear: Sinon.stub().returns(),
      get: Sinon.stub(),
      set: Sinon.stub().returns()
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with the instruction to clear filters', () => {
      beforeEach(() => {
        payload = {
          clearFilters: 'reset'
        }
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitViewNoticeService.go(noticeId, payload, yarStub)

        expect(result).to.equal({})
      })

      it('clears the "noticesFilter" object from the session', async () => {
        await SubmitViewNoticeService.go(noticeId, payload, yarStub)

        expect(yarStub.clear.called).to.be.true()
      })
    })

    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitViewNoticeService.go(noticeId, payload, yarStub)

        expect(result).to.equal({})
      })

      it('saves a default "noticesFilter" object in the session', async () => {
        await SubmitViewNoticeService.go(noticeId, payload, yarStub)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).to.equal(`noticeFilter-${noticeId}`)
        expect(setArgs[1]).to.equal({
          licence: null,
          recipient: null,
          status: null
        })
      })
    })

    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          licence: '01/123',
          recipient: 'carol.shaw@atari.co.uk',
          status: 'sent'
        }
      })

      it('returns a result that tells the controller to redirect to the index page', async () => {
        const result = await SubmitViewNoticeService.go(noticeId, payload, yarStub)

        expect(result).to.equal({})
      })

      it('saves the submitted filters as the "noticesFilter" object in the session', async () => {
        await SubmitViewNoticeService.go(noticeId, payload, yarStub)

        const setArgs = yarStub.set.args[0]

        expect(setArgs[0]).to.equal(`noticeFilter-${noticeId}`)
        expect(setArgs[1]).to.equal({
          licence: '01/123',
          recipient: 'carol.shaw@atari.co.uk',
          status: 'sent'
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {
          licence: '12345678909876543210'
        }
      })

      describe('and the results are paginated', () => {
        beforeEach(() => {
          Sinon.stub(FetchNoticeService, 'go').resolves({ notice, notifications, totalNumber: 70 })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitViewNoticeService.go(noticeId, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'manage',
            error: {
              errorList: [{ href: '#licence', text: 'Licence number must be 11 characters or less' }],
              licence: { text: 'Licence number must be 11 characters or less' }
            },
            filters: {
              licence: '12345678909876543210',
              openFilter: true,
              recipient: null,
              status: null
            },
            backLink: { href: '/system/notices', text: 'Go back to notices' },
            createdBy: 'test@wrls.gov.uk',
            dateCreated: '21 February 2025',
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
            pageTitle: 'Warning alert (page 1 of 3)',
            pageTitleCaption: `Notice ${notice.referenceCode}`,
            pagination: {
              component: {
                items: [
                  {
                    current: true,
                    href: '/system/notices/a40dcb94-cb01-4fce-9a46-94b49eca2057',
                    number: 1,
                    visuallyHiddenText: 'Page 1'
                  },
                  {
                    current: false,
                    href: '/system/notices/a40dcb94-cb01-4fce-9a46-94b49eca2057?page=2',
                    number: 2,
                    visuallyHiddenText: 'Page 2'
                  },
                  {
                    current: false,
                    href: '/system/notices/a40dcb94-cb01-4fce-9a46-94b49eca2057?page=3',
                    number: 3,
                    visuallyHiddenText: 'Page 3'
                  }
                ],
                next: {
                  href: '/system/notices/a40dcb94-cb01-4fce-9a46-94b49eca2057?page=2'
                }
              },
              numberOfPages: 3
            },
            reference: notice.referenceCode,
            showingDeclaration: 'Showing 2 of 70 notifications',
            status: 'error',
            totalNumber: 70
          })
        })
      })

      describe('and the results are not paginated', () => {
        beforeEach(() => {
          Sinon.stub(FetchNoticeService, 'go').resolves({ notice, notifications, totalNumber: 2 })
        })

        it('returns the page data for the view, including any errors', async () => {
          const result = await SubmitViewNoticeService.go(noticeId, payload, yarStub)

          expect(result).to.equal({
            activeNavBar: 'manage',
            error: {
              errorList: [{ href: '#licence', text: 'Licence number must be 11 characters or less' }],
              licence: { text: 'Licence number must be 11 characters or less' }
            },
            filters: {
              licence: '12345678909876543210',
              openFilter: true,
              recipient: null,
              status: null
            },
            backLink: { href: '/system/notices', text: 'Go back to notices' },
            createdBy: 'test@wrls.gov.uk',
            dateCreated: '21 February 2025',
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
            pageTitleCaption: `Notice ${notice.referenceCode}`,
            pagination: {
              numberOfPages: 1
            },
            reference: notice.referenceCode,
            showingDeclaration: 'Showing all 2 notifications',
            status: 'error',
            totalNumber: 2
          })
        })
      })
    })
  })
})
