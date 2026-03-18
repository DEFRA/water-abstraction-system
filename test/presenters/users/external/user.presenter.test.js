'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../../app/models/licence.model.js')
const UsersFixture = require('../../../support/fixtures/users.fixture.js')
const { formatLongDate } = require('../../../../app/presenters/base.presenter.js')
const { generateUUID, today } = require('../../../../app/lib/general.lib.js')
const { tomorrow, yesterday } = require('../../../support/general.js')

// Thing under test
const UserPresenter = require('../../../../app/presenters/users/external/user.presenter.js')

describe('Users - External - User Presenter', () => {
  let back
  let licences
  let outstandingVerifications
  let user
  let viewingUserScope

  beforeEach(() => {
    back = 'users'
    licences = [
      _licence('FE/TC/H/US/ER/01', today(), 'user'),
      _licence('FE/TC/H/US/ER/02', tomorrow(), 'user_returns'),
      _licence('FE/TC/H/US/ER/03', null, 'primary_user')
    ]
    outstandingVerifications = _outstandingVerifications()
    user = UsersFixture.external()
    viewingUserScope = ['manage_accounts']
  })

  it('correctly presents the data', () => {
    const result = UserPresenter.go(user, outstandingVerifications, licences, viewingUserScope, back)

    expect(result).to.equal({
      backLink: {
        href: '/system/users',
        text: 'Go back to users'
      },
      displayLicenceEndedMessage: true,
      id: user.id,
      lastSignedIn: '6 October 2022 at 10:00:00',
      licences: [
        {
          currentLicenceHolder: licences[0].licenceVersions[0].licenceVersionHolder.derivedName,
          id: licences[0].id,
          licenceLink: `/system/licences/${licences[0].id}/summary`,
          licenceRef: licences[0].licenceRef,
          permissions: 'Basic access',
          status: 'expired'
        },
        {
          currentLicenceHolder: licences[1].licenceVersions[0].licenceVersionHolder.derivedName,
          id: licences[1].id,
          licenceLink: `/system/licences/${licences[1].id}/summary`,
          licenceRef: licences[1].licenceRef,
          permissions: 'Returns user',
          status: null
        },
        {
          currentLicenceHolder: licences[2].licenceVersions[0].licenceVersionHolder.derivedName,
          id: licences[2].id,
          licenceLink: `/system/licences/${licences[2].id}/summary`,
          licenceRef: licences[2].licenceRef,
          permissions: 'Primary user',
          status: null
        }
      ],
      outstandingVerifications: [
        {
          code: outstandingVerifications[0].verificationCode,
          count: 2,
          createdOn: formatLongDate(outstandingVerifications[0].createdAt),
          licenceHolder: outstandingVerifications[0].licenceHolder,
          licenceRef: outstandingVerifications[0].licenceRef,
          link: `/system/licences/${outstandingVerifications[0].licenceId}/summary`
        },
        {
          code: outstandingVerifications[1].verificationCode,
          count: 2,
          createdOn: formatLongDate(outstandingVerifications[1].createdAt),
          licenceHolder: outstandingVerifications[1].licenceHolder,
          licenceRef: outstandingVerifications[1].licenceRef,
          link: `/system/licences/${outstandingVerifications[1].licenceId}/summary`
        },
        {
          code: outstandingVerifications[2].verificationCode,
          count: 1,
          createdOn: formatLongDate(outstandingVerifications[2].createdAt),
          licenceHolder: outstandingVerifications[2].licenceHolder,
          licenceRef: outstandingVerifications[2].licenceRef,
          link: `/system/licences/${outstandingVerifications[2].licenceId}/summary`
        }
      ],
      pageTitle: 'User external@example.co.uk',
      pageTitleCaption: 'External',
      permissions: 'None',
      roles: [],
      showEditButton: true,
      status: 'enabled'
    })
  })

  describe('the "backLink" property', () => {
    describe('when the "back" query parameter is set to "users"', () => {
      it('returns a link to the users page', () => {
        const result = UserPresenter.go(user, outstandingVerifications, licences, viewingUserScope, back)

        expect(result.backLink).to.equal({
          href: '/system/users',
          text: 'Go back to users'
        })
      })
    })

    describe('when the "back" query parameter is not set to "users"', () => {
      beforeEach(() => {
        back = 'search'
      })

      it('returns a link to the search page', () => {
        const result = UserPresenter.go(user, outstandingVerifications, licences, viewingUserScope, back)

        expect(result.backLink).to.equal({
          href: '/',
          text: 'Go back to search'
        })
      })
    })
  })

  describe('the "displayLicenceEndedMessage" property', () => {
    describe('when at least one licence has a status of "expired", "revoked" or "lapsed"', () => {
      it('returns "true"', () => {
        const result = UserPresenter.go(user, outstandingVerifications, licences, viewingUserScope, back)

        expect(result.displayLicenceEndedMessage).to.be.true()
      })
    })

    describe('when no licences have a status of "expired", "revoked" or "lapsed"', () => {
      beforeEach(() => {
        for (const licence of licences) {
          licence.expiredDate = null
        }
      })

      it('returns "false"', () => {
        const result = UserPresenter.go(user, outstandingVerifications, licences, viewingUserScope, back)

        expect(result.displayLicenceEndedMessage).to.be.false()
      })
    })
  })

  describe('the "lastSignedIn" property', () => {
    describe('when the lastLogin is set', () => {
      it('returns the last signed in date and time', () => {
        const result = UserPresenter.go(user, outstandingVerifications, licences, viewingUserScope, back)

        expect(result.lastSignedIn).to.equal('6 October 2022 at 10:00:00')
      })
    })

    describe('when the lastLogin is "null"', () => {
      beforeEach(() => {
        user.lastLogin = null
      })

      it('returns "Never signed in"', () => {
        const result = UserPresenter.go(user, outstandingVerifications, licences, viewingUserScope, back)

        expect(result.lastSignedIn).to.equal('Never signed in')
      })
    })
  })

  describe('the "roles" property', () => {
    describe('when the user is determined to have "Basic access" permissions', () => {
      beforeEach(() => {
        user = UsersFixture.external('none')
      })

      it('returns an empty array', () => {
        const result = UserPresenter.go(user, outstandingVerifications, licences, viewingUserScope, back)

        expect(result.roles).to.be.empty()
      })
    })

    describe('when the user is determined to have "Returns user" permissions', () => {
      beforeEach(() => {
        user = UsersFixture.external('user_returns')
      })

      it('returns the correct roles for a "Returns user"', () => {
        const result = UserPresenter.go(user, outstandingVerifications, licences, viewingUserScope, back)

        expect(result.roles).to.equal([
          {
            description: 'Submit returns for the linked licences',
            name: 'Returns user'
          }
        ])
      })
    })

    describe('when the user is determined to have "Primary user" permissions', () => {
      beforeEach(() => {
        user = UsersFixture.external('primary_user')
      })

      it('returns the correct roles for a "Primary user"', () => {
        const result = UserPresenter.go(user, outstandingVerifications, licences, viewingUserScope, back)

        expect(result.roles).to.equal([
          {
            description: 'Create and manage other external user accounts for the linked licences',
            name: 'Primary user'
          },
          {
            description: 'Submit returns for the linked licences',
            name: 'Returns user'
          }
        ])
      })
    })
  })

  describe('the "showEditButton" property', () => {
    describe('when the viewing user has "manage_accounts" in their scope', () => {
      it('returns "true"', () => {
        const result = UserPresenter.go(user, outstandingVerifications, licences, viewingUserScope, back)

        expect(result.showEditButton).to.be.true()
      })
    })

    describe('when the viewing user does not have "manage_accounts" in their scope', () => {
      beforeEach(() => {
        viewingUserScope = []
      })

      it('returns "false"', () => {
        const result = UserPresenter.go(user, outstandingVerifications, licences, viewingUserScope, back)

        expect(result.showEditButton).to.be.false()
      })
    })
  })
})

function _licence(licenceRef, expiredDate, role) {
  const licenceVersionId = generateUUID()
  const licenceDocumentHeaderId = generateUUID()

  const licence = LicenceModel.fromJson({
    expiredDate,
    id: generateUUID(),
    lapsedDate: null,
    licenceRef,
    revokedDate: null
  })

  licence.licenceVersions = [
    {
      id: licenceVersionId,
      licenceId: licence.id,
      licenceVersionHolder: {
        derivedName: 'Current Holder',
        id: generateUUID(),
        licenceVersionId
      }
    }
  ]

  licence.licenceDocumentHeader = {
    id: licenceDocumentHeaderId,
    licenceEntityRoles: _licenceEntityRoles(role),
    licenceRef: licence.licenceRef
  }

  return licence
}

function _licenceEntityRoles(role) {
  const licenceEntityRoles = [{ id: generateUUID(), role }]

  if (role === 'user_returns') {
    licenceEntityRoles.push({ id: generateUUID(), role })
  }

  return licenceEntityRoles
}

function _outstandingVerifications() {
  return [
    {
      id: generateUUID(),
      verificationCode: 'c7SgB',
      createdAt: today(),
      licenceId: generateUUID(),
      licenceRef: 'FE/TC/H/US/ER/01',
      licenceHolder: 'Current Holder'
    },
    {
      id: generateUUID(),
      verificationCode: 'c7SgB',
      createdAt: today(),
      licenceId: generateUUID(),
      licenceRef: 'FE/TC/H/US/ER/03',
      licenceHolder: 'Current Holder'
    },
    {
      id: generateUUID(),
      verificationCode: 'Qz4aK',
      createdAt: yesterday(),
      licenceId: generateUUID(),
      licenceRef: 'FE/TC/H/US/ER/04',
      licenceHolder: 'Current Holder'
    }
  ]
}
