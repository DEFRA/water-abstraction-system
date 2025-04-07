'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helper
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

// Thing under test
const ViewLicenceCommunicationsPresenter = require('../../../app/presenters/licences/view-licence-communications.presenter.js')

describe('View Licence Communications presenter', () => {
  let communications
  const licenceId = 'e7aefa9b-b832-41c8-9add-4e3e03cc1331'
  const documentId = 'd5eacebe-ff92-4704-99f7-9e4e6112ab98'

  beforeEach(() => {
    communications = [
      {
        id: '3ce7d0b6-610f-4cb2-9d4c-9761db797141',
        messageType: 'letter',
        messageRef: 'returns_invitation_licence_holder_letter',
        event: {
          createdAt: '2024-05-15T10:27:15.000Z',
          metadata: {
            name: 'Returns: invitation',
            options: {}
          },
          type: 'notification',
          subtype: 'returnInvitation',
          status: 'processed',
          issuer: 'admin-internal@wrls.gov.uk'
        }
      }
    ]

    Sinon.stub(FeatureFlagsConfig, 'enableNotificationsView').value(true)
  })

  describe('when provided with populated communications data', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceCommunicationsPresenter.go(communications, documentId, licenceId)

      expect(result).to.equal({
        communications: [
          {
            id: '3ce7d0b6-610f-4cb2-9d4c-9761db797141',
            link: '/system/notifications/3ce7d0b6-610f-4cb2-9d4c-9761db797141?id=e7aefa9b-b832-41c8-9add-4e3e03cc1331',
            method: 'Letter',
            sender: 'admin-internal@wrls.gov.uk',
            sent: '15 May 2024',
            type: {
              label: 'Returns: invitation',
              pdf: false,
              sentVia: 'sent 15 May 2024 via letter'
            }
          }
        ]
      })
    })

    describe('the "link" property', () => {
      describe('when the "enableNotificationsView" is true', () => {
        it('returns the link as "/system/notifications/communicationId?id=licenceId"', () => {
          const result = ViewLicenceCommunicationsPresenter.go(communications, documentId, licenceId)

          expect(result.communications[0].link).to.equal(
            '/system/notifications/3ce7d0b6-610f-4cb2-9d4c-9761db797141?id=e7aefa9b-b832-41c8-9add-4e3e03cc1331'
          )
        })
      })

      describe('when the "enableNotificationsView" is false', () => {
        beforeEach(() => {
          Sinon.stub(FeatureFlagsConfig, 'enableNotificationsView').value(false)
        })

        it('returns the link as "/licences/documentId/communications/communicationId"', () => {
          const result = ViewLicenceCommunicationsPresenter.go(communications, documentId, licenceId)

          expect(result.communications[0].link).to.equal(
            '/licences/d5eacebe-ff92-4704-99f7-9e4e6112ab98/communications/3ce7d0b6-610f-4cb2-9d4c-9761db797141'
          )
        })
      })
    })

    describe('the "messageRef" property', () => {
      describe('when the message ref contains pdf', () => {
        beforeEach(() => {
          communications[0].messageRef = 'pdf.return_form'
        })

        it('returns that communication type', () => {
          const result = ViewLicenceCommunicationsPresenter.go(communications, documentId, licenceId)

          expect(result.communications[0].type).to.equal({
            label: 'Returns: invitation',
            pdf: true,
            sentVia: 'sent 15 May 2024 via letter'
          })
        })
      })

      describe('when the message ref does not contain pdf', () => {
        it('returns that communication type', () => {
          const result = ViewLicenceCommunicationsPresenter.go(communications, documentId, licenceId)

          expect(result.communications[0].type).to.equal({
            label: 'Returns: invitation',
            pdf: false,
            sentVia: 'sent 15 May 2024 via letter'
          })
        })
      })
    })

    describe('the "messageType" property', () => {
      beforeEach(() => {
        communications[0].messageType = 'i AM in senTence case'
      })

      describe('when the message type is present', () => {
        it('returns the method key in sentence case', () => {
          const result = ViewLicenceCommunicationsPresenter.go(communications, documentId, licenceId)

          expect(result.communications[0].method).to.equal('I am in sentence case')
        })
      })
    })

    describe('when the communication is a "Water abstraction alert"', () => {
      beforeEach(() => {
        communications[0].event.metadata.name = 'Water abstraction alert'
        communications[0].event.metadata.options.sendingAlertType = 'test'
      })

      it('returns the type object with an alert text', () => {
        const result = ViewLicenceCommunicationsPresenter.go(communications)

        expect(result.communications[0].type).to.equal({
          label: 'Test - Water abstraction alert',
          pdf: false,
          sentVia: 'sent 15 May 2024 via letter'
        })
      })
    })
  })
})
