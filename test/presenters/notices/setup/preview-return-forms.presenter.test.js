'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PreviewReturnFormsPresenter = require('../../../../app/presenters/notices/setup/preview-return-forms.presenter.js')

describe('Preview Return Forms Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = PreviewReturnFormsPresenter.go(session)

      expect(result).to.equal({
        cover: {
          title: 'Water abstraction day return'
        }
      })
    })
  })
})
