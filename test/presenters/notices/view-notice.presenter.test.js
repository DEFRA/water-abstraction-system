'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateReferenceCode } = require('../../support/helpers/notification.helper.js')

// Thing under test
const ViewNoticePresenter = require('../../../app/presenters/notices/view-notice.presenter.js')

describe('Notices - View Notice presenter', () => {
  let notice
  let notifications
  let numberOfPages
  let totalNumber
  let selectedPage

  beforeEach(() => {
    numberOfPages = 1
    selectedPage = 1
    totalNumber = 2

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
  })

  it('correctly presents the data', () => {
    const result = ViewNoticePresenter.go(notice, notifications, totalNumber, selectedPage, numberOfPages)

    expect(result).to.equal({
      backLink: { href: '/system/notices', text: 'Go back to notices' },
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
      reference: notice.referenceCode,
      sentBy: 'test@wrls.gov.uk',
      showingDeclaration: 'Showing all 2 notifications',
      status: 'error'
    })
  })

  describe('the "notifications" property', () => {
    describe('the "recipient" property', () => {
      describe('when the "messageType" is "letter"', () => {
        describe('and the notification was created by the legacy system (has postcode rather than line_7', () => {
          beforeEach(() => {
            notifications[0].personalisation.address_line_6 = null
            notifications[0].personalisation.postcode = 'CB23 1ZZ'
          })

          it('returns only the populated address lines as an array', () => {
            const result = ViewNoticePresenter.go(notice, notifications, totalNumber, selectedPage, numberOfPages)

            expect(result.notifications[0].recipient).to.equal([
              'Clean Water Limited',
              'c/o Bob Bobbles',
              'Water Lane',
              'Swampy Heath',
              'CAMBRIDGESHIRE',
              'CB23 1ZZ'
            ])
          })
        })

        describe('and the notification was created by this system (has line_7 rather than postcode', () => {
          beforeEach(() => {
            // NOTE: Because our addresses go through NotifyAddressPresenter _before_ sending, what we save to the DB
            // will never feature a blank line in the middle of the address. So, if address_line_7 is populated, it is
            // because _all_ the address lines are populated
            notifications[0].personalisation.address_line_5 = 'Cambridge'
            notifications[0].personalisation.address_line_6 = 'CAMBRIDGESHIRE'
            notifications[0].personalisation.address_line_7 = 'CB23 1ZZ'
          })

          it('returns only the populated address lines as an array', () => {
            const result = ViewNoticePresenter.go(notice, notifications, totalNumber, selectedPage, numberOfPages)

            expect(result.notifications[0].recipient).to.equal([
              'Clean Water Limited',
              'c/o Bob Bobbles',
              'Water Lane',
              'Swampy Heath',
              'Cambridge',
              'CAMBRIDGESHIRE',
              'CB23 1ZZ'
            ])
          })
        })
      })

      describe('when the "messageType" is "letter"', () => {
        it('returns the recipient email in an array', () => {
          const result = ViewNoticePresenter.go(notice, notifications, totalNumber, selectedPage, numberOfPages)

          expect(result.notifications[1].recipient).to.equal(['shaw.carol@atari.com'])
        })
      })
    })
  })

  describe('the "pageTitle" property', () => {
    describe('when the notice is an abstraction alert', () => {
      describe('and there is only one page of results', () => {
        it('returns the "pageTitle" without page info', () => {
          const result = ViewNoticePresenter.go(notice, notifications, totalNumber, selectedPage, numberOfPages)

          expect(result.pageTitle).to.equal('Warning alert')
        })
      })

      describe('and there are multiple pages of results', () => {
        beforeEach(() => {
          numberOfPages = 3
        })

        it('returns the "pageTitle" with page info', () => {
          const result = ViewNoticePresenter.go(notice, notifications, totalNumber, selectedPage, numberOfPages)

          expect(result.pageTitle).to.equal('Warning alert (page 1 of 3)')
        })
      })
    })

    describe('when the notice is not an abstraction alert', () => {
      beforeEach(() => {
        notice.subtype = 'returnInvitation'
        notice.alertType = null
      })

      describe('and there is only one page of results', () => {
        it('returns the "pageTitle" without page info', () => {
          const result = ViewNoticePresenter.go(notice, notifications, totalNumber, selectedPage, numberOfPages)

          expect(result.pageTitle).to.equal('Returns invitation')
        })
      })

      describe('and there are multiple pages of results', () => {
        beforeEach(() => {
          numberOfPages = 3
        })

        it('returns the "pageTitle" with page info', () => {
          const result = ViewNoticePresenter.go(notice, notifications, totalNumber, selectedPage, numberOfPages)

          expect(result.pageTitle).to.equal('Returns invitation (page 1 of 3)')
        })
      })
    })
  })

  describe('the "showingDeclaration" property', () => {
    describe('when there is only one page of results', () => {
      it('returns the "showingDeclaration" without page info', () => {
        const result = ViewNoticePresenter.go(notice, notifications, totalNumber, selectedPage, numberOfPages)

        expect(result.showingDeclaration).to.equal('Showing all 2 notifications')
      })
    })

    describe('when there are multiple pages of results', () => {
      beforeEach(() => {
        totalNumber = 50
      })

      it('returns the "showingDeclaration" with page info', () => {
        const result = ViewNoticePresenter.go(notice, notifications, totalNumber, selectedPage, numberOfPages)

        expect(result.showingDeclaration).to.equal('Showing 2 of 50 notifications')
      })
    })
  })
})
