'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicencesPresenter = require('../../../app/presenters/customers/licences.presenter.js')

describe('Customers - Licences Presenter', () => {
  let licences

  beforeEach(() => {
    licences = []
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = LicencesPresenter.go(licences)

      expect(result).to.equal({
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        pageTitle: 'Licences'
      })
    })
  })
})
