'use strict'

// Test helpers
const NoticesFixture = require('../../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const ViewNotificationPresenter = require('../../../app/presenters/notifications/view-notification.presenter.js')

describe('Notifications - View Notification presenter', () => {
  let licence
  let notice
  let notification

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    }

    notice = NoticesFixture.returnsInvitation()
    notification = NotificationsFixture.returnsInvitationEmail(notice)
    notification.event = notice
  })

  it('correctly presents the data', () => {
    const result = ViewNotificationPresenter(notification, licence)

    expect(result).toEqual({
      activeNavBar: 'search',
      address: [],
      alertDetails: null,
      backLink: { href: `/system/licences/${licence.id}/communications`, text: 'Go back to communications' },
      contents: notification.plaintext,
      errorDetails: null,
      messageType: 'email',
      pageTitle: 'Returns invitation',
      pageTitleCaption: `Licence ${licence.licenceRef}`,
      paperForm: null,
      reference: notice.referenceCode,
      returnedDate: null,
      sentDate: '2 April 2025',
      sentBy: notice.issuer,
      sentTo: notification.recipient,
      status: notification.status
    })
  })

  describe('the "activeNavBar" property', () => {
    describe('when a licence is provided', () => {
      it('returns "search"', () => {
        const result = ViewNotificationPresenter(notification, licence)

        expect(result.activeNavBar).to.be.toEqual('search')
      })
    })

    describe('when no licence is provided', () => {
      it('returns "notices"', () => {
        const result = ViewNotificationPresenter(notification)

        expect(result.activeNavBar).to.be.toEqual('notices')
      })
    })
  })

  describe('the "address" property', () => {
    describe('when the "messageType" is "email"', () => {
      it('returns an empty array', () => {
        const result = ViewNotificationPresenter(notification, licence)

        expect(result.address).toHaveLength(0)
      })
    })

    describe('when the "messageType" is "letter"', () => {
      beforeEach(() => {
        notification = NotificationsFixture.returnsInvitationLetter(notice)
        notification.event = notice
      })

      describe('and it is an older notification where "postcode" is populated', () => {
        beforeEach(() => {
          notification.personalisation.postcode = notification.personalisation.address_line_7
          delete notification.personalisation.address_line_7
        })

        it('returns all populated address fields including postcode', () => {
          const result = ViewNotificationPresenter(notification, licence)

          expect(result.address).toEqual([
            'ACME Services Ltd',
            'ACME Operations Centre',
            'Bakersfield Road',
            'Bakersfield',
            'Bath',
            'SOMERSET',
            'BA1 1AA'
          ])
        })
      })

      describe('and it is a newer notification where "address_line_7" is populated', () => {
        it('returns all populated address fields', () => {
          const result = ViewNotificationPresenter(notification, licence)

          expect(result.address).toEqual([
            'ACME Services Ltd',
            'ACME Operations Centre',
            'Bakersfield Road',
            'Bakersfield',
            'Bath',
            'SOMERSET',
            'BA1 1AA'
          ])
        })
      })

      describe('but only some of the fields are populated', () => {
        beforeEach(() => {
          notification.personalisation.address_line_3 = ''
          notification.personalisation.address_line_5 = ''
        })

        it('returns only the populated address fields', () => {
          const result = ViewNotificationPresenter(notification, licence)

          expect(result.address).toEqual([
            'ACME Services Ltd',
            'ACME Operations Centre',
            'Bakersfield',
            'SOMERSET',
            'BA1 1AA'
          ])
        })
      })
    })
  })

  describe('the "alertDetails" property', () => {
    describe('when the notification is not a water abstraction alert', () => {
      it('returns null', () => {
        const result = ViewNotificationPresenter(notification, licence)

        expect(result.alertDetails).toBeNull()
      })
    })

    describe('when the notification is a water abstraction alert', () => {
      beforeEach(() => {
        notice = NoticesFixture.alertStop()
        notification = NotificationsFixture.abstractionAlertEmail(notice)
        notification.event = notice
      })

      describe('and its an older notification', () => {
        beforeEach(() => {
          delete notification.personalisation.alertType
          delete notification.personalisation.label
        })

        describe('where "monitoring_station_name" is populated', () => {
          it('returns details for the alert, including the monitoring station name', () => {
            const result = ViewNotificationPresenter(notification, licence)

            expect(result.alertDetails).toEqual({
              alertType: 'Not recorded',
              monitoringStation: 'Death star',
              threshold: '100m3/s'
            })
          })
        })

        describe('where "alertType" is not populated', () => {
          it('returns details for the alert, though alert type is "Not recorded"', () => {
            const result = ViewNotificationPresenter(notification, licence)

            expect(result.alertDetails).toEqual({
              alertType: 'Not recorded',
              monitoringStation: 'Death star',
              threshold: '100m3/s'
            })
          })
        })
      })

      describe('and its a newer notification', () => {
        describe('where "label" is populated', () => {
          it('returns details for the alert, including the monitoring station name', () => {
            const result = ViewNotificationPresenter(notification, licence)

            expect(result.alertDetails).toEqual({
              alertType: 'Stop',
              monitoringStation: 'Death star',
              threshold: '100m3/s'
            })
          })
        })

        describe('where "alertType" is populated', () => {
          beforeEach(() => {
            // NOTE: The formatting is done by a helper. But we have this here to highlight there is some formatting
            // taking place
            notification.personalisation.alertType = 'stop_or_reduce'
          })

          it('returns details for the alert, including the alert type', () => {
            const result = ViewNotificationPresenter(notification, licence)

            expect(result.alertDetails).toEqual({
              alertType: 'Stop or reduce',
              monitoringStation: 'Death star',
              threshold: '100m3/s'
            })
          })
        })
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when a licence is provided', () => {
      it('returns a back link to the view licence communications page', () => {
        const result = ViewNotificationPresenter(notification, licence)

        expect(result.backLink).to.be.toEqual({
          href: `/system/licences/${licence.id}/communications`,
          text: 'Go back to communications'
        })
      })
    })

    describe('when a return log id is provided', () => {
      it('returns a back link to the view return log communications page', () => {
        const returnLogId = generateUUID()

        const result = ViewNotificationPresenter(notification, null, returnLogId)

        expect(result.backLink).to.be.toEqual({
          href: `/system/return-logs/${returnLogId}/communications`,
          text: 'Go back to return log'
        })
      })
    })

    describe('when a company contact id is provided', () => {
      it('returns a back link to the view company contact page', () => {
        const companyContactId = generateUUID()

        const result = ViewNotificationPresenter(notification, null, null, companyContactId)

        expect(result.backLink).to.be.toEqual({
          href: `/system/company-contacts/${companyContactId}/communications`,
          text: 'Go back to company contact'
        })
      })
    })

    describe('when no licence is provided', () => {
      it('returns a back link to the view notice page', () => {
        const result = ViewNotificationPresenter(notification)

        expect(result.backLink).to.be.toEqual({
          href: `/system/notices/${notice.id}`,
          text: `Go back to notice ${notice.referenceCode}`
        })
      })
    })
  })

  describe('the "pageTitleCaption" property', () => {
    describe('when a licence is provided', () => {
      it('returns a caption with the licence reference', () => {
        const result = ViewNotificationPresenter(notification, licence)

        expect(result.pageTitleCaption).to.be.toEqual(`Licence ${licence.licenceRef}`)
      })
    })

    describe('when no licence is provided', () => {
      it('returns a caption with the notice reference', () => {
        const result = ViewNotificationPresenter(notification)

        expect(result.pageTitleCaption).to.be.toEqual(`Notice ${notice.referenceCode}`)
      })
    })
  })

  describe('the "paperForm" property', () => {
    describe('when the notification is not a paper return or reminder', () => {
      it('returns null', () => {
        const result = ViewNotificationPresenter(notification, licence)

        expect(result.paperForm).toBeNull()
      })
    })

    describe('when the notification is a paper return or reminder', () => {
      beforeEach(() => {
        notice = NoticesFixture.returnsPaperForm()
        notification = NotificationsFixture.paperReturn(notice)
        notification.event = notice
      })

      describe('and its an older notification where the "pdf" was not saved', () => {
        beforeEach(() => {
          notification.pdf = null
          notification.hasPdf = false
        })

        it('returns paper return or reminder details without a link to view the PDF', () => {
          const result = ViewNotificationPresenter(notification, licence)

          expect(result.paperForm).toEqual({
            downloadLink: null,
            link: `/system/return-logs/${notification.personalisation.qr_url}/details`,
            period: '1 April 2024 to 31 March 2025',
            purpose: 'Potable Water Supply - Direct',
            reference: notification.personalisation.format_id,
            siteDescription: 'Wiley Coyote Borehole No 1'
          })
        })
      })

      describe('and its a newer notification where the "pdf" was saved', () => {
        beforeEach(() => {
          notification.hasPdf = true
        })

        it('returns paper return or reminder details with a link to view the PDF', () => {
          const result = ViewNotificationPresenter(notification, licence)

          expect(result.paperForm).toEqual({
            downloadLink: `/system/notifications/${notification.id}/download`,
            link: `/system/return-logs/${notification.personalisation.qr_url}/details`,
            period: '1 April 2024 to 31 March 2025',
            purpose: 'Potable Water Supply - Direct',
            reference: notification.personalisation.format_id,
            siteDescription: 'Wiley Coyote Borehole No 1'
          })
        })
      })

      describe('and the return log it was for did not have a "site description"', () => {
        beforeEach(() => {
          notification.personalisation.site_description = null
        })

        it('returns an empty site description in the "paperForm" details', () => {
          const result = ViewNotificationPresenter(notification, licence)

          expect(result.paperForm.siteDescription).toHaveLength(0)
        })
      })
    })
  })

  describe('the "reference" property', () => {
    describe('when a licence is provided', () => {
      it('returns the notice reference', () => {
        const result = ViewNotificationPresenter(notification, licence)

        expect(result.reference).to.be.toEqual(notice.referenceCode)
      })
    })

    describe('when no licence is provided', () => {
      it('returns null', () => {
        const result = ViewNotificationPresenter(notification)

        expect(result.reference).toBeNull()
      })
    })
  })

  describe('the "returnedDate" property', () => {
    describe('when the notification does not have a "returnedAt" value', () => {
      it('returns null', () => {
        const result = ViewNotificationPresenter(notification, licence)

        expect(result.returnedDate).toBeNull()
      })
    })

    describe('when the notification does have a "returnedAt" value', () => {
      beforeEach(() => {
        notification.returnedAt = new Date('2025-10-13')
      })

      it('returns the "returnedAt" date formatted for the page', () => {
        const result = ViewNotificationPresenter(notification, licence)

        expect(result.returnedDate).toEqual('13 October 2025')
      })
    })
  })

  describe('the "sentTo" property', () => {
    describe('when the "messageType" is "email"', () => {
      it('returns the "recipient"', () => {
        const result = ViewNotificationPresenter(notification, licence)

        expect(result.sentTo).toEqual('grace.hopper@acme.co.uk')
      })
    })

    describe('when the "messageType" is "letter"', () => {
      beforeEach(() => {
        notification = NotificationsFixture.returnsInvitationLetter(notice)
        notification.event = notice
      })

      it('returns the "address_line_1"', () => {
        const result = ViewNotificationPresenter(notification, licence)

        expect(result.sentTo).toEqual('ACME Services Ltd')
      })
    })
  })
})
