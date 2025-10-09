'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../fixtures/notifications.fixture.js')
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
    const result = ViewNotificationPresenter.go(licence, notification)

    expect(result).to.equal({
      address: [],
      alertDetails: null,
      backLink: { href: `/system/licences/${licence.id}/communications`, text: 'Go back to communications' },
      contents: notification.plaintext,
      licenceRef: licence.licenceRef,
      messageType: 'email',
      pageTitle: 'Returns invitation',
      pageTitleCaption: `Licence ${licence.licenceRef}`,
      paperForm: null,
      reference: notice.referenceCode,
      sentDate: '2 April 2025',
      sentBy: notice.issuer,
      sentTo: notification.recipient,
      status: notification.status
    })
  })

  describe('the "address" property', () => {
    describe('when the "messageType" is "email"', () => {
      it('returns an empty array', () => {
        const result = ViewNotificationPresenter.go(licence, notification)

        expect(result.address).to.be.empty()
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
          const result = ViewNotificationPresenter.go(licence, notification)

          expect(result.address).to.equal([
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
          const result = ViewNotificationPresenter.go(licence, notification)

          expect(result.address).to.equal([
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
          const result = ViewNotificationPresenter.go(licence, notification)

          expect(result.address).to.equal([
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
        const result = ViewNotificationPresenter.go(licence, notification)

        expect(result.alertDetails).to.be.null()
      })
    })

    describe('when the notification is a water abstraction alert', () => {
      beforeEach(() => {
        notice = NoticesFixture.alertStop()
        notification = NotificationsFixture.abstractionAlertEmail(notice)
        notification.event = notice
      })

      describe('and its an older notification where only "monitoring_station_name" is populated', () => {
        beforeEach(() => {
          delete notification.personalisation.label
        })

        it('returns details for the alert, including the monitoring station name', () => {
          const result = ViewNotificationPresenter.go(licence, notification)

          expect(result.alertDetails).to.equal({
            monitoringStation: 'Death star',
            threshold: '100m3/s'
          })
        })
      })

      describe('and its a newer notification where "label" is populated', () => {
        it('returns details for the alert, including the monitoring station name', () => {
          const result = ViewNotificationPresenter.go(licence, notification)

          expect(result.alertDetails).to.equal({
            monitoringStation: 'Death star',
            threshold: '100m3/s'
          })
        })
      })
    })
  })

  describe('the "pageTitle" property', () => {
    describe('when the notification is not a water abstraction alert', () => {
      it('returns the "mapping" for the notice subtype as the title', () => {
        const result = ViewNotificationPresenter.go(licence, notification)

        expect(result.pageTitle).to.equal('Returns invitation')
      })
    })

    describe('when the notification is a water abstraction alert', () => {
      beforeEach(() => {
        notice = NoticesFixture.alertStop()
        notification = NotificationsFixture.abstractionAlertEmail(notice)
        notification.event = notice
      })

      it('returns the "alert type" as the title', () => {
        const result = ViewNotificationPresenter.go(licence, notification)

        expect(result.pageTitle).to.equal('Stop alert')
      })
    })
  })

  describe('the "paperForm" property', () => {
    describe('when the notification is not a paper return or reminder', () => {
      it('returns null', () => {
        const result = ViewNotificationPresenter.go(licence, notification)

        expect(result.paperForm).to.be.null()
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
          const result = ViewNotificationPresenter.go(licence, notification)

          expect(result.paperForm).to.equal({
            downloadLink: null,
            link: `/system/return-logs?id=${notification.personalisation.qr_url}`,
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
          const result = ViewNotificationPresenter.go(licence, notification)

          expect(result.paperForm).to.equal({
            downloadLink: `/system/notifications/${notification.id}/download`,
            link: `/system/return-logs?id=${notification.personalisation.qr_url}`,
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
          const result = ViewNotificationPresenter.go(licence, notification)

          expect(result.paperForm.siteDescription).to.be.empty()
        })
      })
    })
  })

  describe('the "sentTo" property', () => {
    describe('when the "messageType" is "email"', () => {
      it('returns the "recipient"', () => {
        const result = ViewNotificationPresenter.go(licence, notification)

        expect(result.sentTo).to.equal('grace.hopper@acme.co.uk')
      })
    })

    describe('when the "messageType" is "letter"', () => {
      beforeEach(() => {
        notification = NotificationsFixture.returnsInvitationLetter(notice)
        notification.event = notice
      })

      it('returns the "address_line_1"', () => {
        const result = ViewNotificationPresenter.go(licence, notification)

        expect(result.sentTo).to.equal('ACME Services Ltd')
      })
    })
  })
})
