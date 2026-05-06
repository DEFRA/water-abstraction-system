'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../../app/models/licence.model.js')
const UsersFixture = require('../../../support/fixtures/users.fixture.js')
const { generateUUID, today } = require('../../../../app/lib/general.lib.js')
const { tomorrow } = require('../../../support/general.js')

// Thing under test
const LicencesPresenter = require('../../../../app/presenters/users/external/licences.presenter.js')

describe('Users - External - Licences Presenter', () => {
  let back
  let user
  let licences
  let viewingUserScope

  beforeEach(() => {
    back = 'users'
    licences = [
      _licence('FE/TC/H/US/ER/01', today(), 'user'),
      _licence('FE/TC/H/US/ER/02', tomorrow(), 'user_returns'),
      _licence('FE/TC/H/US/ER/03', null, 'primary_user')
    ]
    user = UsersFixture.external()
    viewingUserScope = ['manage_accounts']
  })

  it('correctly presents the data', () => {
    const result = LicencesPresenter.go(user, licences, viewingUserScope, back)

    expect(result).to.equal({
      activeNavBar: 'users',
      backLink: {
        href: '/system/users',
        text: 'Go back to users'
      },
      backQueryString: '?back=users',
      displayLicenceEndedMessage: true,
      pageTitle: 'Licences',
      pageTitleCaption: user.username,
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
      showUnlinkButton: true
    })
  })

  describe('the "displayLicenceEndedMessage" property', () => {
    describe('when at least one licence has a status of "expired", "revoked" or "lapsed"', () => {
      it('returns "true"', () => {
        const result = LicencesPresenter.go(user, licences, viewingUserScope, back)

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
        const result = LicencesPresenter.go(user, licences, viewingUserScope, back)

        expect(result.displayLicenceEndedMessage).to.be.false()
      })
    })
  })

  describe('the "showUnlinkButton" property', () => {
    describe('when the viewing user has "manage_accounts" in their scope', () => {
      it('returns "true"', () => {
        const result = LicencesPresenter.go(user, licences, viewingUserScope, back)

        expect(result.showUnlinkButton).to.be.true()
      })
    })

    describe('when the viewing user does not have "manage_accounts" in their scope', () => {
      beforeEach(() => {
        viewingUserScope = []
      })

      it('returns "false"', () => {
        const result = LicencesPresenter.go(user, licences, viewingUserScope, back)

        expect(result.showUnlinkButton).to.be.false()
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
