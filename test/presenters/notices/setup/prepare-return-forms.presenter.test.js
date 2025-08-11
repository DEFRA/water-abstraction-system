'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PrepareReturnFormsPresenter = require('../../../../app/presenters/notices/setup/prepare-return-forms.presenter.js')

describe('Notices - Setup - Prepare Return Forms Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = PrepareReturnFormsPresenter.go(session)

      expect(result).to.equal({
        cover: {
          title: 'Water abstraction day return'
        }
      })
    })
  })
})
