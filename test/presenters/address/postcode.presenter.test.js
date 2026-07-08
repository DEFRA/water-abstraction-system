'use strict'

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
    const result = PostcodePresenter(session)

    expect(result).toEqual({
      activeNavBar: 'manage',
      backLink: {
        href: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/contact-type',
        text: 'Back'
      },
      internationalLink: '/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/international',
      pageTitle: 'Enter a UK postcode',
      pageTitleCaption: null,
      postcode: null
    })
  })

  describe('the "pageTitleCaption" property', () => {
    describe('when the property has not been configured', () => {
      it('returns null', () => {
        const result = PostcodePresenter(session)

        expect(result.pageTitleCaption).toEqual(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.pageTitleCaption = 'Super awesome caption'
      })

      it('returns the set value', () => {
        const result = PostcodePresenter(session)

        expect(result.pageTitleCaption).toEqual('Super awesome caption')
      })
    })
  })

  describe('the "postcode" property', () => {
    describe('when called with a postcode set in the session', () => {
      beforeEach(async () => {
        session.addressJourney.address.postcode = 'SW1A 1AA'
      })

      it('returns the postcode', () => {
        const result = PostcodePresenter(session)

        expect(result.postcode).toEqual('SW1A 1AA')
      })
    })

    describe('when called with no postcode set in the session', () => {
      it('returns null', () => {
        const result = PostcodePresenter(session)

        expect(result.postcode).toEqual(null)
      })
    })
  })

  describe('the "activeNavBar" property', () => {
    describe('when called with an activeNavBar set in the session', () => {
      it('returns the activeNavBar', () => {
        const result = PostcodePresenter(session)

        expect(result.activeNavBar).toEqual(session.addressJourney.activeNavBar)
      })
    })

    describe('when called with no activeNavBar set in the session', () => {
      beforeEach(async () => {
        session.addressJourney.activeNavBar = null
      })

      it('returns null', () => {
        const result = PostcodePresenter(session)

        expect(result.activeNavBar).toEqual(null)
      })
    })
  })
})
