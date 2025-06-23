'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const NotifyPreviewRequest = require('../../../../app/requests/notify/notify-preview.request.js')

// Thing under test
const PreviewPresenter = require('../../../../app/presenters/notices/setup/preview.presenter.js')

describe('Preview presenter', () => {
  const sessionId = '7334a25e-9723-4732-a6e1-8e30c5f3732e'

  let testNotification

  beforeEach(() => {
    testNotification = _testNotification()

    Sinon.stub(NotifyPreviewRequest, 'send').resolves({ plaintext: 'Preview of the notification contents' })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when provided with a populated notification', () => {
    it('correctly presents the data', async () => {
      const result = await PreviewPresenter.go(testNotification, sessionId)

      expect(result).to.equal({
        address: ['c/o Bob Bobbles', 'Water Lane', 'Swampy Heath', 'Marshton', 'CAMBRIDGESHIRE', 'CB23 1ZZ'],
        backLink: `/system/notices/setup/${sessionId}/check`,
        caption: 'Licence 11/1111',
        contents: 'Preview of the notification contents',
        messageType: 'letter',
        pageTitle: 'Returns Invitation Returns To Letter'
      })
    })

    describe('the "address" property', () => {
      describe('when the "messageType" is "letter"', () => {
        beforeEach(() => {
          testNotification.messageType = 'letter'
        })

        describe('and only some of the address values in the "notifications.personalisation" property are filled', () => {
          beforeEach(() => {
            testNotification.personalisation.address_line_1 = ''
            testNotification.personalisation.address_line_3 = ''
          })

          it('correctly formats the address data into an array with the populated values', async () => {
            const result = await PreviewPresenter.go(testNotification, sessionId)

            expect(result.address).to.equal(['Water Lane', 'Marshton', 'CAMBRIDGESHIRE', 'CB23 1ZZ'])
          })
        })
      })

      describe('when the "messageType" is "email"', () => {
        beforeEach(() => {
          testNotification.messageType = 'email'
        })

        it('returns null', async () => {
          const result = await PreviewPresenter.go(testNotification, sessionId)

          expect(result.address).to.be.null()
        })
      })
    })

    describe('the "caption" property', () => {
      describe('when there is a single licence', () => {
        beforeEach(() => {
          testNotification.licences = '["11/1111"]'
        })

        it('correctly displays the caption for a single licence', async () => {
          const result = await PreviewPresenter.go(testNotification, sessionId)

          expect(result.caption).to.equal('Licence 11/1111')
        })
      })

      describe('when there is more than one licence but less than five', () => {
        beforeEach(() => {
          testNotification.licences = '["11/1111","22/2222","33/3333","44/4444"]'
        })

        it('correctly displays the caption for the licences', async () => {
          const result = await PreviewPresenter.go(testNotification, sessionId)

          expect(result.caption).to.equal('Licences 11/1111, 22/2222, 33/3333, 44/4444')
        })
      })

      describe('when there are more than four licences', () => {
        beforeEach(() => {
          testNotification.licences = '["11/1111","22/2222","33/3333","44/4444","55/5555"]'
        })

        it('correctly displays the caption for the first four licences', async () => {
          const result = await PreviewPresenter.go(testNotification, sessionId)

          expect(result.caption).to.equal('Licences 11/1111, 22/2222, 33/3333, 44/4444...')
        })
      })
    })

    describe('the "pageTitle" property', () => {
      beforeEach(() => {
        testNotification.messageRef = 'returns_reminder_returns_to_letter'
      })

      it('correctly formats the notifications "messageRef"', async () => {
        const result = await PreviewPresenter.go(testNotification, sessionId)

        expect(result.pageTitle).to.equal('Returns Reminder Returns To Letter')
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
      address_line_1: 'c/o Bob Bobbles',
      address_line_2: 'Water Lane',
      address_line_3: 'Swampy Heath',
      address_line_4: 'Marshton',
      address_line_5: 'CAMBRIDGESHIRE',
      address_line_6: 'CB23 1ZZ',
      periodEndDate: '30 June 2025',
      periodStartDate: '1 April 2025',
      returnDueDate: '28 July 2025'
    }
  }
}
