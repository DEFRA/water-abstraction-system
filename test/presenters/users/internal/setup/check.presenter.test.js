'use strict'

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const CheckPresenter = require('../../../../../app/presenters/users/internal/setup/check.presenter.js')

describe('Users - Internal - Setup - Check Presenter', () => {
  let session

  beforeEach(() => {
    session = { email: 'bob.bobbles@environment-agency.gov.uk', id: generateUUID(), permission: 'billing_and_data' }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckPresenter.go(session)

      expect(result).toEqual({
        access: null,
        activeNavBar: 'users',
        email: session.email,
        links: {
          access: `/system/users/internal/setup/${session.id}/access`,
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

  describe('the "access" property', () => {
    describe('when creating a new user', () => {
      it('returns null', () => {
        const result = CheckPresenter.go(session)

        expect(result.access).toBeNull()
      })
    })

    describe('when editing an existing user', () => {
      beforeEach(() => {
        session.access = 'enabled'
      })

      it('returns the users access status', () => {
        const result = CheckPresenter.go(session)

        expect(result.access).toEqual('Enabled')
      })
    })
  })

  describe('the "showEmailChangeLink" property', () => {
    describe('when creating a new user', () => {
      it('returns true', () => {
        const result = CheckPresenter.go(session)

        expect(result.showEmailChangeLink).toBe(true)
      })
    })

    describe('when editing an existing user that is awaiting verification', () => {
      beforeEach(() => {
        session.user = { currentStatus: 'awaiting' }
      })

      it('returns true', () => {
        const result = CheckPresenter.go(session)

        expect(result.showEmailChangeLink).toBe(true)
      })
    })

    describe('when editing an existing user that is NOT awaiting verification', () => {
      beforeEach(() => {
        session.user = { currentStatus: 'enabled' }
      })

      it('returns false', () => {
        const result = CheckPresenter.go(session)

        expect(result.showEmailChangeLink).toBe(false)
      })
    })
  })
})
