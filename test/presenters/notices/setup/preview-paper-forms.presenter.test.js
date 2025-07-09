'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PreviewPaperFormsPresenter = require('../../../../app/presenters/notices/setup/preview-paper-form.presenter.js')

describe('Preview Paper Forms Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = PreviewPaperFormsPresenter.go(session)

      expect(result).to.equal({})
    })
  })
})
