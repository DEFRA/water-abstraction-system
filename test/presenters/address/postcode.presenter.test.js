'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const PostcodePresenter = require('../../../app/presenters/address/postcode.presenter.js')

describe('Address - Postcode Presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061',
      addressJourney: {
        activeNavBar: 'manage',
        address: {},
        backLink: {
          href: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/contact-type',
          text: 'Back'
        },
        redirectUrl: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/add-recipient'
      }
    }
  })

  it('correctly presents the data', () => {
    const result = PostcodePresenter.go(session)

    expect(result).to.equal({
      activeNavBar: 'manage',
      backLink: {
        href: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/contact-type',
        text: 'Back'
      },
      internationalLink: '/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/international',
      pageTitle: 'Enter a UK postcode',
      postcode: null
    })
  })

  describe('the "postcode" property', () => {
    describe('when called with a postcode set in the session', () => {
      beforeEach(async () => {
        session.addressJourney.address.postcode = 'SW1A 1AA'
      })

      it('returns the postcode', () => {
        const result = PostcodePresenter.go(session)

        expect(result.postcode).to.equal('SW1A 1AA')
      })
    })

    describe('when called with no postcode set in the session', () => {
      it('returns null', () => {
        const result = PostcodePresenter.go(session)

        expect(result.postcode).to.equal(null)
      })
    })
  })
})
