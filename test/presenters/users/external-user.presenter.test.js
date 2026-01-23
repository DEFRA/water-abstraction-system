'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const ExternalUserPresenter = require('../../../app/presenters/users/external-user.presenter.js')

describe('Users - External User Presenter', () => {
  let user

  beforeEach(() => {
    user = UsersFixture.external()
  })

  it('correctly presents the data', () => {
    const result = ExternalUserPresenter.go(user)

    expect(result).to.equal({
      backLink: {
        href: '/',
        text: 'Go back to search'
      },
      companies: [],
      id: 100007,
      lastSignedIn: 'Last signed in 6 October 2022 at 10:00:00',
      pageTitle: 'User external@example.co.uk',
      pageTitleCaption: 'External',
      status: 'enabled'
    })
  })

  describe('the "lastSignedIn" property', () => {
    describe('when the lastLogin is set', () => {
      it('returns the last signed in date and time', () => {
        const result = ExternalUserPresenter.go(user)

        expect(result.lastSignedIn).to.equal('Last signed in 6 October 2022 at 10:00:00')
      })
    })

    describe('when the lastLogin is "null"', () => {
      beforeEach(() => {
        const externalUser = UsersFixture.external()
        const { $status } = externalUser

        user = { ...externalUser, lastLogin: null, $status }
      })

      it('returns "Never signed in"', () => {
        const result = ExternalUserPresenter.go(user)

        expect(result.lastSignedIn).to.equal('Never signed in')
      })
    })
  })

  describe('the "companies" property', () => {
    describe('when the user has no associated licence entity', () => {
      it('returns an empty companiesarray', () => {
        const result = ExternalUserPresenter.go(user)

        expect(result.companies).to.equal([])
      })
    })

    describe('when the user has an associated licence entity', () => {
      describe('when the licence entity has no licence entity roles', () => {
        beforeEach(() => {
          user.licenceEntity = { licenceEntityRoles: [] }
        })

        it('returns an empty companies array', () => {
          const result = ExternalUserPresenter.go(user)

          expect(result.companies).to.equal([])
        })
      })

      describe('when the licence entity has licence entity roles', () => {
        beforeEach(() => {
          user.licenceEntity = {
            licenceEntityRoles: [
              {
                companyEntity: { id: 'company-1', name: 'Company 1' },
                role: 'user'
              },
              {
                companyEntity: { id: 'company-1', name: 'Company 1' },
                role: 'user_returns'
              },
              {
                companyEntity: { id: 'company-1', name: 'Company 1' },
                role: 'primary_user'
              },
              {
                companyEntity: { id: 'company-2', name: 'Company 2' },
                role: 'user'
              },
              {
                companyEntity: { id: 'company-2', name: 'Company 2' },
                role: 'user_returns'
              },
              {
                companyEntity: { id: 'company-3', name: 'Company 3' },
                role: 'user'
              }
            ]
          }
        })

        it('returns the most significant role name for each company', () => {
          const result = ExternalUserPresenter.go(user)

          expect(result.companies).to.equal([
            {
              companyName: 'Company 1',
              mostSignificantRoleName: 'Primary user'
            },
            {
              companyName: 'Company 2',
              mostSignificantRoleName: 'Returns user'
            },
            {
              companyName: 'Company 3',
              mostSignificantRoleName: 'Agent'
            }
          ])
        })
      })

      describe('when the licence entity does not have any of the specified roles', () => {
        beforeEach(() => {
          user.licenceEntity = {
            licenceEntityRoles: [
              {
                companyEntity: { id: 'company-1', name: 'Company 1' },
                role: 'UNKNOWN_ROLE'
              }
            ]
          }
        })

        it('returns "Unknown role"', () => {
          const result = ExternalUserPresenter.go(user)

          expect(result.companies).to.equal([
            {
              companyName: 'Company 1',
              mostSignificantRoleName: 'Unknown role'
            }
          ])
        })
      })
    })
  })
})
