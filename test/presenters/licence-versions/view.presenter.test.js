'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewPresenter = require('../../../app/presenters/licence-versions/view.presenter.js')

describe('Licence Versions - View presenter', () => {
  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ViewPresenter.go()

      expect(result).to.equal({
        backLink: {
          href: '',
          text: 'Back'
        },
        pageTitle: 'Licence version starting',
        pageTitleCaption: 'Licence'
      })
    })
  })
})
