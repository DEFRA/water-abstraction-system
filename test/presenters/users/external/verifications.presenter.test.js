// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import * as UsersFixture from '../../../support/fixtures/users.fixture.js'
import { formatLongDate } from '../../../../app/presenters/base.presenter.js'
import { yesterday } from '../../../support/general.js'
import { generateUUID, today } from '../../../../app/lib/general.lib.js'

// Thing under test
import VerificationsPresenter from '../../../../app/presenters/users/external/verifications.presenter.js'

describe('Users - External - Verifications Presenter', () => {
  let back
  let user
  let verifications
  let viewingUserScope

  beforeEach(() => {
    back = 'users'
    verifications = _verifications()
    user = UsersFixture.external()
    viewingUserScope = ['manage_accounts']
  })

  it('correctly presents the data', () => {
    const result = VerificationsPresenter(user, verifications, viewingUserScope, back)

    expect(result).toEqual({
      activeNavBar: 'users',
      backLink: {
        href: '/system/users',
        text: 'Go back to users'
      },
      backQueryString: '?back=users',
      pageTitle: 'Verifications',
      pageTitleCaption: user.username,
      verifications: [
        {
          code: verifications[0].verificationCode,
          count: 2,
          createdOn: formatLongDate(verifications[0].createdAt),
          licenceHolder: verifications[0].licenceDocumentHeaders[0].licence.licenceVersions[0].company.name,
          licenceRef: verifications[0].licenceDocumentHeaders[0].licence.licenceRef,
          link: `/system/licences/${verifications[0].licenceDocumentHeaders[0].licence.id}/summary`,
          verifiedOn: null
        },
        {
          code: verifications[0].verificationCode,
          count: 2,
          createdOn: formatLongDate(verifications[0].createdAt),
          licenceHolder: verifications[0].licenceDocumentHeaders[1].licence.licenceVersions[0].company.name,
          licenceRef: verifications[0].licenceDocumentHeaders[1].licence.licenceRef,
          link: `/system/licences/${verifications[0].licenceDocumentHeaders[1].licence.id}/summary`,
          verifiedOn: null
        },
        {
          code: verifications[1].verificationCode,
          count: 1,
          createdOn: formatLongDate(verifications[1].createdAt),
          licenceHolder: verifications[1].licenceDocumentHeaders[0].licence.licenceVersions[0].company.name,
          licenceRef: verifications[1].licenceDocumentHeaders[0].licence.licenceRef,
          link: `/system/licences/${verifications[1].licenceDocumentHeaders[0].licence.id}/summary`,
          verifiedOn: formatLongDate(today())
        }
      ]
    })
  })

  describe('the "verifications" property', () => {
    describe('the "count" property', () => {
      describe('when there are multiple verifications with the same verification code', () => {
        it('returns the correct count of verifications with that code', () => {
          const result = VerificationsPresenter(user, verifications, viewingUserScope, back)

          expect(result.verifications[0].count).toEqual(2)
          expect(result.verifications[1].count).toEqual(2)
        })
      })

      describe('when there is only one verification with a particular verification code', () => {
        it('returns a count of "1" for that code', () => {
          const result = VerificationsPresenter(user, verifications, viewingUserScope, back)

          expect(result.verifications[2].count).toEqual(1)
        })
      })
    })

    describe('the "verifiedOn" property', () => {
      describe('when the verification has a "verifiedAt" value', () => {
        it('returns the formatted "verifiedAt" date', () => {
          const result = VerificationsPresenter(user, verifications, viewingUserScope, back)

          expect(result.verifications[2].verifiedOn).toEqual(formatLongDate(today()))
        })
      })

      describe('when the verification does not have a "verifiedAt" value', () => {
        it('returns null', () => {
          const result = VerificationsPresenter(user, verifications, viewingUserScope, back)

          expect(result.verifications[0].verifiedOn).toBeNull()
          expect(result.verifications[1].verifiedOn).toBeNull()
        })
      })
    })
  })
})

function _verifications() {
  return [
    {
      createdAt: yesterday(),
      id: generateUUID(),
      verifiedAt: null,
      verificationCode: 'c7SgB',
      licenceDocumentHeaders: [
        {
          id: generateUUID(),
          licenceRef: 'FE/TC/H/US/ER/01',
          licence: {
            id: generateUUID(),
            licenceRef: 'FE/TC/H/US/ER/01',
            licenceVersions: [
              {
                id: generateUUID(),
                company: {
                  name: 'Current Holder multi'
                }
              }
            ]
          }
        },
        {
          id: generateUUID(),
          licenceRef: 'FE/TC/H/US/ER/03',
          licence: {
            id: generateUUID(),
            licenceRef: 'FE/TC/H/US/ER/03',
            licenceVersions: [
              {
                id: generateUUID(),
                company: {
                  name: 'Current Holder multi'
                }
              }
            ]
          }
        }
      ]
    },
    {
      createdAt: yesterday(),
      id: generateUUID(),
      verifiedAt: today(),
      verificationCode: 'Qz4aK',
      licenceDocumentHeaders: [
        {
          id: generateUUID(),
          licenceRef: 'FE/TC/H/US/ER/02',
          licence: {
            id: generateUUID(),
            licenceRef: 'FE/TC/H/US/ER/02',
            licenceVersions: [
              {
                id: generateUUID(),
                company: {
                  name: 'Current Holder single'
                }
              }
            ]
          }
        }
      ]
    }
  ]
}
