'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CheckNoticeTypePresenter = require('../../../../app/presenters/notices/setup/check-notice-type.presenter.js')

describe('Check Notice Type Presenter', () => {
  let session

  beforeEach(() => {
    session = { id: '123' }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckNoticeTypePresenter.go(session)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/notice-type`,
        continueButton: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Continue to check recipients'
        },
        pageTitle: 'Check the notice type'
      })
    })
  })
})
