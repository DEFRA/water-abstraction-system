'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NoticeTypePresenter = require('../../../../app/presenters/notices/setup/notice-type.presenter.js')

describe('Notice Type Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = NoticeTypePresenter.go(session)

      expect(result).to.equal({ pageTitle: 'Select the notice type' })
    })
  })
})
