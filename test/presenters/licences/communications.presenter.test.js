'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CommunicationsPresenter = require('../../../app/presenters/licences/communications.presenter.js')

describe('Communications presenter', () => {
  let communications

  beforeEach(() => {
    communications = [{
      id: '3ce7d0b6-610f-4cb2-9d4c-9761db797141',
      messageType: 'letter',
      messageRef: 'returns_invitation_licence_holder_letter',
      event: {
        createdAt: '2024-05-15T10:27:15.000Z',
        metadata: {
          name: 'Returns: invitation',
          options: {
          }
        },
        type: 'notification',
        subtype: 'returnInvitation',
        status: 'processed',
        issuer: 'admin-internal@wrls.gov.uk'
      }
    }]
  })

  describe('when provided with populated communications data', () => {
    it('correctly presents the data', () => {
      const result = CommunicationsPresenter.go(communications)

      expect(result).to.equal({
        communications: [{
          id: '3ce7d0b6-610f-4cb2-9d4c-9761db797141',
          method: 'Letter',
          sender: 'admin-internal@wrls.gov.uk',
          sent: '15 May 2024',
          type: {
            alert: null,
            label: 'Returns: invitation',
            pdf: false,
            sentVia: 'sent 15 May 2024 via letter'
          }
        }
        ]
      })
    })
    
    describe("the 'messageRef' property", () => {
      describe('when the message ref contains pdf', () => {
        it('returns that communication type', () => {
          communications[0].messageRef = 'pdf.return_form'
          const result = CommunicationsPresenter.go(communications)

          expect(result.communications[0].type).to.equal({
            alert: null,
            label: 'Returns: invitation',
            pdf: true,
            sentVia: 'sent 15 May 2024 via letter'
          })
        })
      })
      describe('when the message ref does not contain pdf', () => {
        it('returns that communication type', () => {
          const result = CommunicationsPresenter.go(communications)

          expect(result.communications[0].type).to.equal({
            alert: null,
            label: 'Returns: invitation',
            pdf: false,
            sentVia: 'sent 15 May 2024 via letter'
          })
        })
      })
    })

    describe('the \'messageType\' property', () => {
      describe('when the message type is present', () => {
        it('returns the method key in sentence case', () => {
          communications[0].messageType = 'i AM in senTence case'
          const result = CommunicationsPresenter.go(communications)

          expect(result.communications[0].method).to.equal('I am in sentence case')
        })
      })
    })

    describe("when the communication is a 'Water abstraction alert'", () => {
      it('returns the type object with an alert text', () => {
        communications[0].event.metadata.name = 'Water abstraction alert'
        communications[0].event.metadata.options.sendingAlertType = 'test'
        const result = CommunicationsPresenter.go(communications)

        expect(result.communications[0].type).to.equal({
          alert: 'Test - Water abstraction alert',
          label: 'Water abstraction alert',
          pdf: false,
          sentVia: 'sent 15 May 2024 via letter'
        })
      })
    })
  })
})
