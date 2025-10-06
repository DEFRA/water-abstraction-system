'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const StandardPresenter = require('../../../../app/presenters/notices/setup/standard.presenter.js')

describe('Standard Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = StandardPresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: '/system/notices',
          text: 'Back'
        },
        pageTitle: 'Select a notice type',
        radioOptions: [
          {
            text: 'Invitations',
            value: 'invitations'
          },
          {
            text: 'Reminders',
            value: 'reminders'
          }
        ]
      })
    })
  })
})
