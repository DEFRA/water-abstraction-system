'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ViewManagePresenter = require('../../../../app/presenters/customers/contact/view-manage.presenter.js')

describe('Customers - Contact - View Manage Presenter', () => {
  beforeEach(() => {})

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ViewManagePresenter.go()

      expect(result).to.equal({
        backLink: {
          href: '/system/search',
          text: 'Back'
        },
        pageTitle: 'Manage contact settings for'
      })
    })
  })
})
