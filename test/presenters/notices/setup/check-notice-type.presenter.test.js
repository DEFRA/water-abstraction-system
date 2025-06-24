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
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckNoticeTypePresenter.go(session)

      expect(result).to.equal({
        pageTitle: 'Check the notice type'
      })
    })
  })
})
