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
      id: user.id,
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
        user.lastLogin = null
      })

      it('returns "Never signed in"', () => {
        const result = ExternalUserPresenter.go(user)

        expect(result.lastSignedIn).to.equal('Never signed in')
      })
    })
  })

  describe('the "companies" property', () => {
    describe('when the user has no associated licence entity', () => {
      it('returns an empty companies array', () => {
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
                companyEntity: { licenceDocumentHeaders: [], id: 'company-1', name: 'Company 1' },
                companyEntityId: 'company-1',
                role: 'user'
              },
              {
                companyEntity: { licenceDocumentHeaders: [], id: 'company-1', name: 'Company 1' },
                companyEntityId: 'company-1',
                role: 'user_returns'
              },
              {
                companyEntity: { licenceDocumentHeaders: [], id: 'company-1', name: 'Company 1' },
                companyEntityId: 'company-1',
                role: 'primary_user'
              },
              {
                companyEntity: { licenceDocumentHeaders: [], id: 'company-2', name: 'Company 2' },
                companyEntityId: 'company-2',
                role: 'user'
              },
              {
                companyEntity: { licenceDocumentHeaders: [], id: 'company-2', name: 'Company 2' },
                companyEntityId: 'company-2',
                role: 'user_returns'
              },
              {
                companyEntity: { licenceDocumentHeaders: [], id: 'company-3', name: 'Company 3' },
                companyEntityId: 'company-3',
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
              licences: [],
              mostSignificantRoleName: 'Primary user',
              showLicences: false
            },
            {
              companyName: 'Company 2',
              licences: [],
              mostSignificantRoleName: 'Returns user',
              showLicences: false
            },
            {
              companyName: 'Company 3',
              licences: [],
              mostSignificantRoleName: 'Agent',
              showLicences: false
            }
          ])
        })
      })

      describe('when the licence entity does not have any of the specified roles', () => {
        beforeEach(() => {
          user.licenceEntity = {
            licenceEntityRoles: [
              {
                companyEntity: { licenceDocumentHeaders: [], id: 'company-1', name: 'Company 1' },
                companyEntityId: 'company-1',
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
              licences: [],
              mostSignificantRoleName: 'Unknown role',
              showLicences: false
            }
          ])
        })
      })
    })
  })

  describe('the "showLicences" property of a company', () => {
    describe('when the company does not have any associated licences', () => {
      beforeEach(() => {
        user.licenceEntity = {
          licenceEntityRoles: [
            {
              companyEntity: { licenceDocumentHeaders: [], id: 'company-1', name: 'Company 1' },
              companyEntityId: 'company-1',
              role: 'user'
            }
          ]
        }
      })

      it('returns "false"', () => {
        const result = ExternalUserPresenter.go(user)

        expect(result.companies[0].showLicences).to.be.false()
      })
    })

    describe('when the company has associated licences', () => {
      beforeEach(() => {
        user.licenceEntity = {
          licenceEntityRoles: [
            {
              companyEntity: {
                id: 'company-1',
                licenceDocumentHeaders: [
                  {
                    id: 'licence-document-header-1',
                    licenceRef: 'LIC-001',
                    metadata: {
                      contacts: [{ role: 'Licence holder', name: 'John Doe' }]
                    },
                    licence: { id: 'licence-1' }
                  }
                ]
              },
              companyEntityId: 'company-1',
              role: 'user'
            }
          ]
        }
      })

      it('returns "true"', () => {
        const result = ExternalUserPresenter.go(user)

        expect(result.companies[0].showLicences).to.be.true()
      })
    })
  })

  describe('the "licences" property of a company', () => {
    describe('when the company does not have any associated licences', () => {
      beforeEach(() => {
        user.licenceEntity = {
          licenceEntityRoles: [
            {
              companyEntity: { licenceDocumentHeaders: [], id: 'company-1', name: 'Company 1' },
              companyEntityId: 'company-1',
              role: 'user'
            }
          ]
        }
      })

      it('returns an empty array', () => {
        const result = ExternalUserPresenter.go(user)

        expect(result.companies[0].licences).to.be.an.array()
        expect(result.companies[0].licences).to.be.empty()
      })
    })

    describe('when the company has associated licences', () => {
      beforeEach(() => {
        user.licenceEntity = {
          licenceEntityRoles: [
            {
              companyEntity: {
                id: 'company-1',
                licenceDocumentHeaders: [
                  {
                    id: 'licence-document-header-1',
                    licenceRef: 'LIC-001',
                    metadata: {
                      contacts: [{ role: 'Licence holder', name: 'John Doe' }]
                    },
                    licence: { id: 'licence-1' }
                  }
                ]
              },
              companyEntityId: 'company-1',
              role: 'user'
            }
          ]
        }
      })

      it('returns an array of associated licences', () => {
        const result = ExternalUserPresenter.go(user)

        expect(result.companies[0].licences).to.equal([
          {
            licenceLink: '/system/licences/licence-1/summary',
            licenceRef: 'LIC-001',
            licenceHolderName: 'John Doe'
          }
        ])
      })
    })
  })
})
