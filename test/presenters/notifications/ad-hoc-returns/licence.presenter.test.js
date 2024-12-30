'use strict'

// Test framework dependencies
const { describe, it, beforeEach } = require('node:test')
const { expect } = require('@hapi/code')

// Thing under test
const LicencePresenter = require('../../../../app/presenters/notifications/ad-hoc-returns/licence.presenter.js')

describe('Ad-hoc Returns Licence presenter', () => {
  let session

  describe('when provided with a ad-hoc returns setup session record', () => {
    beforeEach(() => {
      session = {
        id: '86d7555c-0518-4f9c-9148-38f71fd4f6e7',
        data: {}
      }
    })

    describe('where the user has not previously entered a licence ref', () => {
      it('correctly presents the data', () => {
        const result = LicencePresenter.go(session)

        expect(result).to.equal({
          sessionId: '86d7555c-0518-4f9c-9148-38f71fd4f6e7',
          licenceRef: null
        })
      })
    })

    describe('where the user has previously entered a licence ref', () => {
      beforeEach(() => {
        session.licenceRef = '01/111'
      })

      it('correctly presents the data', () => {
        const result = LicencePresenter.go(session)

        expect(result).to.equal({
          sessionId: '86d7555c-0518-4f9c-9148-38f71fd4f6e7',
          licenceRef: '01/111'
        })
      })
    })
  })
})
