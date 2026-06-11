'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const CheckPresenter = require('../../../../../app/presenters/users/internal/setup/check.presenter.js')

describe.only('Users - Internal - Setup - Check Presenter', () => {
  let session

  beforeEach(() => {
    session = { email: 'bob.bobbles@environment-agency.gov.uk', id: generateUUID(), permission: 'billing_and_data' }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckPresenter.go(session)

      expect(result).to.equal({
        activeNavBar: 'users',
        email: session.email,
        links: {
          cancel: `/system/users/internal/setup/${session.id}/cancel`,
          email: `/system/users/internal/setup/${session.id}/email`,
          permissions: `/system/users/internal/setup/${session.id}/permissions`
        },
        pageTitle: 'Check user',
        pageTitleCaption: 'Internal',
        permission: 'Billing and Data',
        showEmailChangeLink: true
      })
    })
  })

  describe('the "showEmailChangeLink" property', () => {
    describe('when creating a new user', () => {
      it('returns true', () => {
        const result = CheckPresenter.go(session)

        expect(result.showEmailChangeLink).to.be.true()
      })
    })

    describe('when editing an existing user that is awaiting verification', () => {
      beforeEach(() => {
        session.user = { status: 'awaiting' }
      })

      it('returns true', () => {
        const result = CheckPresenter.go(session)

        expect(result.showEmailChangeLink).to.be.true()
      })
    })

    describe('when editing an existing user that is NOT awaiting verification', () => {
      beforeEach(() => {
        session.user = { status: 'enabled' }
      })

      it('returns false', () => {
        const result = CheckPresenter.go(session)

        expect(result.showEmailChangeLink).to.be.false()
      })
    })
  })
})
