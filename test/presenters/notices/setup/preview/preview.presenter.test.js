'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const NotifyPreviewRequest = require('../../../../../app/requests/notify/notify-preview.request.js')

// Thing under test
const PreviewPresenter = require('../../../../../app/presenters/notices/setup/preview/preview.presenter.js')

describe('Notices - Setup - Preview - Preview presenter', () => {
  const contactHashId = '9df5923f179a0ed55c13173c16651ed9'
  const licenceMonitoringStationId = 'a4d15f69-5005-4b6e-ab50-3fbae2deec9c'
  const sessionId = '7334a25e-9723-4732-a6e1-8e30c5f3732e'

  let noticeType
  let testNotification

  beforeEach(() => {
    noticeType = 'invitations'
    testNotification = _testNotification()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when provided with a populated notification', () => {
    describe('and notify succeeds in returning the preview data', () => {
      beforeEach(() => {
        Sinon.stub(NotifyPreviewRequest, 'send').resolves({ plaintext: 'Preview of the notification contents' })
      })

      it('correctly presents the data', async () => {
        const result = await PreviewPresenter.go(
          contactHashId,
          noticeType,
          licenceMonitoringStationId,
          testNotification,
          sessionId
        )

        expect(result).to.equal({
          address: [
            'Clean Water Limited',
            'c/o Bob Bobbles',
            'Water Lane',
            'Swampy Heath',
            'Marshton',
            'CAMBRIDGESHIRE',
            'CB23 1ZZ'
          ],
          backLink: `/system/notices/setup/${sessionId}/check`,
          caption: 'Notice RINV-0Q7AD8',
          contents: 'Preview of the notification contents',
          messageType: 'letter',
          pageTitle: 'Returns invitation returns to letter',
          recipientEmail: undefined,
          refreshPageLink: `/system/notices/setup/${sessionId}/preview/${contactHashId}`
        })
      })

      describe('the "address" property', () => {
        describe('when the "messageType" is "letter"', () => {
          beforeEach(() => {
            testNotification.messageType = 'letter'
          })

          describe('and only some of the address values in the "notifications.personalisation" property are filled', () => {
            beforeEach(() => {
              testNotification.personalisation.address_line_6 = ''
              testNotification.personalisation.address_line_7 = ''
            })

            it('correctly formats the address data into an array with the populated values', async () => {
              const result = await PreviewPresenter.go(
                contactHashId,
                noticeType,
                licenceMonitoringStationId,
                testNotification,
                sessionId
              )

              expect(result.address).to.equal([
                'Clean Water Limited',
                'c/o Bob Bobbles',
                'Water Lane',
                'Swampy Heath',
                'Marshton'
              ])
            })
          })
        })

        describe('when the "messageType" is "email"', () => {
          beforeEach(() => {
            testNotification.messageType = 'email'
            testNotification.recipient = 'bob@bobbins.co.uk'
          })

          it('returns a null address', async () => {
            const result = await PreviewPresenter.go(
              contactHashId,
              noticeType,
              licenceMonitoringStationId,
              testNotification,
              sessionId
            )

            expect(result.address).to.be.null()
          })

          it('returns the recipients email address', async () => {
            const result = await PreviewPresenter.go(
              contactHashId,
              noticeType,
              licenceMonitoringStationId,
              testNotification,
              sessionId
            )

            expect(result.recipientEmail).to.equal('bob@bobbins.co.uk')
          })
        })
      })

      describe('the "backLink" property', () => {
        describe('when the "noticeType" is "abstractionAlerts"', () => {
          beforeEach(() => {
            noticeType = 'abstractionAlerts'
          })

          it('returns a link back to the "check-alert" page', async () => {
            const result = await PreviewPresenter.go(
              contactHashId,
              noticeType,
              licenceMonitoringStationId,
              testNotification,
              sessionId
            )

            expect(result.backLink).to.equal(`/system/notices/setup/${sessionId}/preview/${contactHashId}/check-alert`)
          })
        })

        describe('when the "noticeType" is NOT "abstractionAlerts"', () => {
          beforeEach(() => {
            noticeType = 'reminders'
          })

          it('returns a link back to the "check" page', async () => {
            const result = await PreviewPresenter.go(
              contactHashId,
              noticeType,
              licenceMonitoringStationId,
              testNotification,
              sessionId
            )

            expect(result.backLink).to.equal(`/system/notices/setup/${sessionId}/check`)
          })
        })
      })

      describe('the "contents" property', () => {
        it('returns the preview data', async () => {
          const result = await PreviewPresenter.go(
            contactHashId,
            noticeType,
            licenceMonitoringStationId,
            testNotification,
            sessionId
          )

          expect(result.contents).to.equal('Preview of the notification contents')
        })
      })

      describe('the "pageTitle" property', () => {
        beforeEach(() => {
          testNotification.messageRef = 'returns_reminder_returns_to_letter'
        })

        it('correctly formats the notifications "messageRef"', async () => {
          const result = await PreviewPresenter.go(
            contactHashId,
            noticeType,
            licenceMonitoringStationId,
            testNotification,
            sessionId
          )

          expect(result.pageTitle).to.equal('Returns reminder returns to letter')
        })
      })
    })

    describe('and notify fails and returns an error', () => {
      beforeEach(() => {
        Sinon.stub(NotifyPreviewRequest, 'send').resolves({
          errors: [
            {
              error: 'ValidationError',
              message: 'id is not a valid UUID'
            }
          ]
        })
      })

      it('correctly presents the data', async () => {
        const result = await PreviewPresenter.go(
          contactHashId,
          noticeType,
          licenceMonitoringStationId,
          testNotification,
          sessionId
        )

        expect(result).to.equal({
          address: [
            'Clean Water Limited',
            'c/o Bob Bobbles',
            'Water Lane',
            'Swampy Heath',
            'Marshton',
            'CAMBRIDGESHIRE',
            'CB23 1ZZ'
          ],
          backLink: `/system/notices/setup/${sessionId}/check`,
          caption: 'Notice RINV-0Q7AD8',
          contents: 'error',
          messageType: 'letter',
          pageTitle: 'Returns invitation returns to letter',
          recipientEmail: undefined,
          refreshPageLink: `/system/notices/setup/${sessionId}/preview/${contactHashId}`
        })
      })

      describe('the "contents" property', () => {
        it('returns "error"', async () => {
          const result = await PreviewPresenter.go(
            contactHashId,
            noticeType,
            licenceMonitoringStationId,
            testNotification,
            sessionId
          )

          expect(result.contents).to.equal('error')
        })
      })

      describe('the "refreshPageLink" property', () => {
        describe('when the "noticeType" is "abstractionAlerts"', () => {
          beforeEach(() => {
            noticeType = 'abstractionAlerts'
          })

          it('returns a link to the "alert preview" page', async () => {
            const result = await PreviewPresenter.go(
              contactHashId,
              noticeType,
              licenceMonitoringStationId,
              testNotification,
              sessionId
            )

            expect(result.refreshPageLink).to.equal(
              `/system/notices/setup/${sessionId}/preview/${contactHashId}/alert/${licenceMonitoringStationId}`
            )
          })
        })

        describe('when the "noticeType" is NOT "abstractionAlerts"', () => {
          beforeEach(() => {
            noticeType = 'reminders'
          })

          it('returns a link to the "preview" page', async () => {
            const result = await PreviewPresenter.go(
              contactHashId,
              noticeType,
              licenceMonitoringStationId,
              testNotification,
              sessionId
            )

            expect(result.refreshPageLink).to.equal(`/system/notices/setup/${sessionId}/preview/${contactHashId}`)
          })
        })
      })
    })
  })
})

function _testNotification() {
  return {
    templateId: 'e968a387-5bfc-481b-8455-0b91de9d0656',
    licences: '["11/1111"]',
    messageType: 'letter',
    messageRef: 'returns_invitation_returns_to_letter',
    personalisation: {
      name: 'Clean Water Limited',
      address_line_1: 'Clean Water Limited',
      address_line_2: 'c/o Bob Bobbles',
      address_line_3: 'Water Lane',
      address_line_4: 'Swampy Heath',
      address_line_5: 'Marshton',
      address_line_6: 'CAMBRIDGESHIRE',
      address_line_7: 'CB23 1ZZ',
      periodEndDate: '30 June 2025',
      periodStartDate: '1 April 2025',
      returnDueDate: '28 July 2025'
    },
    reference: 'RINV-0Q7AD8'
  }
}
