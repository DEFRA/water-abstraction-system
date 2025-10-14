'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewLicenceCommunicationsPresenter = require('../../../app/presenters/licences/view-licence-communications.presenter.js')

describe('Licences - View Licence Communications presenter', () => {
  const licenceId = 'e7aefa9b-b832-41c8-9add-4e3e03cc1331'
  const documentId = 'd5eacebe-ff92-4704-99f7-9e4e6112ab98'

  let communications

  beforeEach(() => {
    communications = [
      {
        createdAt: new Date('2024-05-15T10:27:15.000Z'),
        id: '3ce7d0b6-610f-4cb2-9d4c-9761db797141',
        messageType: 'letter',
        messageRef: 'returns_invitation_licence_holder_letter',
        event: {
          issuer: 'admin-internal@wrls.gov.uk',
          metadata: {
            name: 'Returns: invitation',
            error: 0,
            options: { excludeLicences: [] }
          },
          status: 'completed',
          subtype: 'returnInvitation',
          type: 'notification'
        }
      }
    ]
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
              sentVia: 'sent 15 May 2024 via letter'
            }
          }
        ]
      })
    })

    describe('the "messageRef" property', () => {
      it('returns that communication type', () => {
        const result = ViewLicenceCommunicationsPresenter.go(communications, documentId, licenceId)

        expect(result.communications[0].type).to.equal({
          label: 'Returns: invitation',
          sentVia: 'sent 15 May 2024 via letter'
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
          sentVia: 'sent 15 May 2024 via letter'
        })
      })
    })
  })
})
