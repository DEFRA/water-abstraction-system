'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const UserExternalPresenter = require('../../../app/presenters/users/user-external.presenter.js')

describe('Users - User External Presenter', () => {
  let user
  let viewingUserScope

  beforeEach(() => {
    user = UsersFixture.external()
    viewingUserScope = ['manage_accounts']
  })

  it('correctly presents the data', () => {
    const result = UserExternalPresenter.go(user, viewingUserScope)

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
      showEditButton: true,
      status: 'enabled'
    })
  })

  describe('the "lastSignedIn" property', () => {
    describe('when the lastLogin is set', () => {
      it('returns the last signed in date and time', () => {
        const result = UserExternalPresenter.go(user, viewingUserScope)

        expect(result.lastSignedIn).to.equal('Last signed in 6 October 2022 at 10:00:00')
      })
    })

    describe('when the lastLogin is "null"', () => {
      beforeEach(() => {
        user.lastLogin = null
      })

      it('returns "Never signed in"', () => {
        const result = UserExternalPresenter.go(user, viewingUserScope)

        expect(result.lastSignedIn).to.equal('Never signed in')
      })
    })
  })

  describe('the "companies" property', () => {
    describe('when the user has no associated licence entity', () => {
      it('returns an empty companies array', () => {
        const result = UserExternalPresenter.go(user, viewingUserScope)

        expect(result.companies).to.equal([])
      })
    })

    describe('when the user has an associated licence entity', () => {
      describe('when the licence entity has no licence entity roles', () => {
        beforeEach(() => {
          user.licenceEntity = { licenceEntityRoles: [] }
        })

        it('returns an empty companies array', () => {
          const result = UserExternalPresenter.go(user, viewingUserScope)

          expect(result.companies).to.equal([])
        })
      })

      describe('when the licence entity has licence entity roles', () => {
        beforeEach(() => {
          user.licenceEntity = {
            licenceEntityRoles: [
              {
                companyEntity: { licenceDocumentHeaders: [], id: 'company-1', name: 'Company 1' },
                role: 'user'
              },
              {
                companyEntity: { licenceDocumentHeaders: [], id: 'company-1', name: 'Company 1' },
                role: 'user_returns'
              },
              {
                companyEntity: { licenceDocumentHeaders: [], id: 'company-1', name: 'Company 1' },
                role: 'primary_user'
              },
              {
                companyEntity: { licenceDocumentHeaders: [], id: 'company-2', name: 'Company 2' },
                role: 'user'
              },
              {
                companyEntity: { licenceDocumentHeaders: [], id: 'company-2', name: 'Company 2' },
                role: 'user_returns'
              },
              {
                companyEntity: { licenceDocumentHeaders: [], id: 'company-3', name: 'Company 3' },
                role: 'user'
              }
            ],
            userVerifications: []
          }
        })

        it('returns the most significant role name for each company', () => {
          const result = UserExternalPresenter.go(user, viewingUserScope)

          expect(result.companies).to.equal([
            {
              companyName: 'Company 1',
              licences: [],
              mostSignificantRoleName: 'Primary user',
              showLicences: false,
              verifications: []
            },
            {
              companyName: 'Company 2',
              licences: [],
              mostSignificantRoleName: 'Returns user',
              showLicences: false,
              verifications: []
            },
            {
              companyName: 'Company 3',
              licences: [],
              mostSignificantRoleName: 'Agent',
              showLicences: false,
              verifications: []
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
            ],
            userVerifications: []
          }
        })

        it('returns "Unknown role"', () => {
          const result = UserExternalPresenter.go(user, viewingUserScope)

          expect(result.companies).to.equal([
            {
              companyName: 'Company 1',
              licences: [],
              mostSignificantRoleName: 'Unknown role',
              showLicences: false,
              verifications: []
            }
          ])
        })
      })

      describe('when the licence entity does not have any roles at all', () => {
        beforeEach(() => {
          user.licenceEntity = {
            licenceEntityRoles: [],
            userVerifications: [
              {
                companyEntity: { id: 'company-1', name: 'Company 1' },
                createdAt: '2022-10-06T10:00:00Z',
                verificationCode: 'Abc123',
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
              }
            ]
          }
        })

        it('returns "No role"', () => {
          const result = UserExternalPresenter.go(user, viewingUserScope)

          expect(result.companies[0].mostSignificantRoleName).to.equal('No role')
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
              role: 'user'
            }
          ],
          userVerifications: []
        }
      })

      it('returns "false"', () => {
        const result = UserExternalPresenter.go(user, viewingUserScope)

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
              role: 'user'
            }
          ],
          userVerifications: []
        }
      })

      it('returns "true"', () => {
        const result = UserExternalPresenter.go(user, viewingUserScope)

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
              role: 'user'
            }
          ],
          userVerifications: []
        }
      })

      it('returns an empty array', () => {
        const result = UserExternalPresenter.go(user, viewingUserScope)

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
              role: 'user'
            }
          ],
          userVerifications: []
        }
      })

      it('returns an array of associated licences', () => {
        const result = UserExternalPresenter.go(user, viewingUserScope)

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

  describe('the "verifications" property of a company', () => {
    describe('when the company does not have any associated verifications', () => {
      beforeEach(() => {
        user.licenceEntity = {
          licenceEntityRoles: [
            {
              companyEntity: { licenceDocumentHeaders: [], id: 'company-1', name: 'Company 1' },
              companyEntityId: 'company-1',
              role: 'user'
            }
          ],
          userVerifications: []
        }
      })

      it('returns an empty array', () => {
        const result = UserExternalPresenter.go(user, viewingUserScope)

        expect(result.companies[0].verifications).to.be.an.array()
        expect(result.companies[0].verifications).to.be.empty()
      })
    })

    describe('when the company has associated verifications', () => {
      beforeEach(() => {
        user.licenceEntity = {
          licenceEntityRoles: [],
          userVerifications: [
            {
              companyEntity: { id: 'company-1', name: 'Company 1' },
              createdAt: '2022-10-06T10:00:00Z',
              verificationCode: 'Abc123',
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
            {
              companyEntity: { id: 'company-2', name: 'Company 2' },
              createdAt: '2022-10-06T10:00:00Z',
              verificationCode: 'Def456',
              licenceDocumentHeaders: [
                {
                  id: 'licence-document-header-2',
                  licenceRef: 'LIC-002',
                  metadata: {
                    contacts: [{ role: 'Licence holder', name: 'Jane Doe' }]
                  },
                  licence: { id: 'licence-2' }
                }
              ]
            },
            {
              companyEntity: { id: 'company-1', name: 'Company 1' },
              createdAt: '2023-10-06T10:00:00Z',
              verificationCode: 'Ghi789',
              licenceDocumentHeaders: [
                {
                  id: 'licence-document-header-3',
                  licenceRef: 'LIC-003',
                  metadata: {
                    contacts: [{ role: 'Licence holder', name: 'Jennie Doe' }]
                  },
                  licence: { id: 'licence-3' }
                }
              ]
            }
          ]
        }
      })

      it('returns an array of associated verifications', () => {
        const result = UserExternalPresenter.go(user, viewingUserScope)
        expect(result.companies[0].verifications).to.equal([
          {
            sent: '6 October 2022',
            verificationCode: 'Abc123',
            licences: [
              {
                licenceLink: '/system/licences/licence-1/summary',
                licenceRef: 'LIC-001',
                licenceHolderName: 'John Doe'
              }
            ]
          },
          {
            sent: '6 October 2023',
            verificationCode: 'Ghi789',
            licences: [
              {
                licenceLink: '/system/licences/licence-3/summary',
                licenceRef: 'LIC-003',
                licenceHolderName: 'Jennie Doe'
              }
            ]
          }
        ])
      })
    })
  })

  describe('the "showEditButton" property', () => {
    describe('when the viewing user has "manage_accounts" in their scope', () => {
      it('returns "true"', () => {
        const result = UserExternalPresenter.go(user, viewingUserScope)

        expect(result.showEditButton).to.be.true()
      })
    })

    describe('when the viewing user does not have "manage_accounts" in their scope', () => {
      beforeEach(() => {
        viewingUserScope = []
      })

      it('returns "false"', () => {
        const result = UserExternalPresenter.go(user, viewingUserScope)

        expect(result.showEditButton).to.be.false()
      })
    })
  })
})
