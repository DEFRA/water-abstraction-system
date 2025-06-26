'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ReturnsForPaperFormsPresenter = require('../../../../app/presenters/notices/setup/returns-for-paper-forms.presenter.js')

describe('Returns For Paper Forms Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ReturnsForPaperFormsPresenter.go(session)

      expect(result).to.equal({ pageTile: 'Select the returns for the paper forms' })
    })
  })
})
