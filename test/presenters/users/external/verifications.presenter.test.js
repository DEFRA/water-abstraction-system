'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UsersFixture = require('../../../support/fixtures/users.fixture.js')
const { formatLongDate } = require('../../../../app/presenters/base.presenter.js')
const { generateUUID, today } = require('../../../../app/lib/general.lib.js')
const { yesterday } = require('../../../support/general.js')

// Thing under test
const VerificationsPresenter = require('../../../../app/presenters/users/external/verifications.presenter.js')

describe('Users - External - Verifications Presenter', () => {
  let back
  let verifications
  let user

  beforeEach(() => {
    back = 'users'
    verifications = _verifications()
    user = UsersFixture.external()
  })

  it('correctly presents the data', () => {
    const result = VerificationsPresenter.go(user, verifications, back)

    expect(result).to.equal({
      backLink: {
        href: '/system/users',
        text: 'Go back to users'
      },
      backQueryString: null,
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

  describe('the "backLink" property', () => {
    describe('when the "back" query parameter is set to "users"', () => {
      it('returns a link to the users page', () => {
        const result = VerificationsPresenter.go(user, verifications, back)

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
        const result = VerificationsPresenter.go(user, verifications, back)

        expect(result.backLink).to.equal({
          href: '/',
          text: 'Go back to search'
        })
      })
    })
  })

  describe('the "backQueryString" property', () => {
    describe('when the "back" query parameter is set to "users"', () => {
      it('returns null', () => {
        const result = VerificationsPresenter.go(user, verifications, back)

        expect(result.backQueryString).to.be.null()
      })
    })

    describe('when the "back" query parameter is not set to "users"', () => {
      beforeEach(() => {
        back = 'search'
      })

      it('returns a link to the search page', () => {
        const result = VerificationsPresenter.go(user, verifications, back)

        expect(result.backQueryString).to.equal(`?back=${back}`)
      })
    })
  })

  describe('the "verifications" property', () => {
    describe('the "count" property', () => {
      describe('when there are multiple verifications with the same verification code', () => {
        it('returns the correct count of verifications with that code', () => {
          const result = VerificationsPresenter.go(user, verifications, back)

          expect(result.verifications[0].count).to.equal(2)
          expect(result.verifications[1].count).to.equal(2)
        })
      })

      describe('when there is only one verification with a particular verification code', () => {
        it('returns a count of "1" for that code', () => {
          const result = VerificationsPresenter.go(user, verifications, back)

          expect(result.verifications[2].count).to.equal(1)
        })
      })
    })

    describe('the "verifiedOn" property', () => {
      describe('when the verification has a "verifiedAt" value', () => {
        it('returns the formatted "verifiedAt" date', () => {
          const result = VerificationsPresenter.go(user, verifications, back)

          expect(result.verifications[2].verifiedOn).to.equal(formatLongDate(today()))
        })
      })

      describe('when the verification does not have a "verifiedAt" value', () => {
        it('returns null', () => {
          const result = VerificationsPresenter.go(user, verifications, back)

          expect(result.verifications[0].verifiedOn).to.be.null()
          expect(result.verifications[1].verifiedOn).to.be.null()
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
