// Test helpers
import * as UsersFixture from '../../../support/fixtures/users.fixture.js'
import { generateUUID, today } from '../../../../app/lib/general.lib.js'
import { licenceEnds } from '../../../support/fixtures/licence.fixture.js'
import { tomorrow } from '../../../support/general.js'

// Thing under test
import LicencesPresenter from '../../../../app/presenters/users/external/licences.presenter.js'

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
    viewingUserScope = ['manage_accounts', 'unlink_licences']
  })

  it('correctly presents the data', () => {
    const result = LicencesPresenter(user, licences, viewingUserScope, back)

    expect(result).toEqual({
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
          currentLicenceHolder: licences[0].licenceVersions[0].company.name,
          id: licences[0].id,
          licenceRef: licences[0].licenceRef,
          link: `/system/licences/${licences[0].id}/summary`,
          permissions: 'Basic access',
          status: 'expired'
        },
        {
          currentLicenceHolder: licences[1].licenceVersions[0].company.name,
          id: licences[1].id,
          licenceRef: licences[1].licenceRef,
          link: `/system/licences/${licences[1].id}/summary`,
          permissions: 'Returns user',
          status: null
        },
        {
          currentLicenceHolder: licences[2].licenceVersions[0].company.name,
          id: licences[2].id,
          licenceRef: licences[2].licenceRef,
          link: `/system/licences/${licences[2].id}/summary`,
          permissions: 'Primary user',
          status: null
        }
      ],
      unregisterActionLink: `/system/users/external/${user.id}/setup?back=${back}`
    })
  })

  describe('the "displayLicenceEndedMessage" property', () => {
    describe('when at least one licence has a status of "expired", "revoked" or "lapsed"', () => {
      it('returns "true"', () => {
        const result = LicencesPresenter(user, licences, viewingUserScope, back)

        expect(result.displayLicenceEndedMessage).toBe(true)
      })
    })

    describe('when no licences have a status of "expired", "revoked" or "lapsed"', () => {
      beforeEach(() => {
        for (const licence of licences) {
          licence.expiredDate = null
        }
      })

      it('returns "false"', () => {
        const result = LicencesPresenter(user, licences, viewingUserScope, back)

        expect(result.displayLicenceEndedMessage).toBe(false)
      })
    })
  })

  describe('the "unregisterActionLink" property', () => {
    describe('when the viewing user has "unlink_licences" in their scope', () => {
      describe('and the external user is the "primary user" on at least one licence', () => {
        it('returns the link to the unlink licences journey', () => {
          const result = LicencesPresenter(user, licences, viewingUserScope, back)

          expect(result.unregisterActionLink).toEqual(`/system/users/external/${user.id}/setup?back=${back}`)
        })
      })

      describe('and the external user is NOT the "primary user" on at least one licence', () => {
        beforeEach(() => {
          licences = [licences[0], licences[1]]
        })

        it('returns "null"', () => {
          const result = LicencesPresenter(user, licences, viewingUserScope, back)

          expect(result.unregisterActionLink).toBeNull()
        })
      })

      describe('and the external user is not linked to any licences', () => {
        beforeEach(() => {
          licences = []
        })

        it('returns "null"', () => {
          const result = LicencesPresenter(user, licences, viewingUserScope, back)

          expect(result.unregisterActionLink).toBeNull()
        })
      })
    })

    describe('when the viewing user does not have "unlink_licences" in their scope', () => {
      beforeEach(() => {
        viewingUserScope = []
      })

      it('returns "null"', () => {
        const result = LicencesPresenter(user, licences, viewingUserScope, back)

        expect(result.unregisterActionLink).toBeNull()
      })
    })
  })
})

function _licence(licenceRef, expiredDate, role) {
  const licenceVersionId = generateUUID()
  const licenceDocumentHeaderId = generateUUID()

  const licence = licenceEnds(expiredDate)

  licence.licenceVersions = [
    {
      id: licenceVersionId,
      issueDate: null,
      licenceId: licence.id,
      startDate: new Date('2022-04-01'),
      status: 'current',
      company: { id: generateUUID(), name: 'Current Holder', type: 'organisation' }
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
