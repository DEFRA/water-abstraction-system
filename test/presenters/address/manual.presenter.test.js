'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ManualPresenter = require('../../../app/presenters/address/manual.presenter.js')

describe('Address - Manual Presenter', () => {
  let session

  beforeEach(async () => {
    session = {
      id: 'fecd5f15-bacf-4b3d-bdcd-ef279a97b061',
      addressJourney: {
        activeNavBar: 'manage',
        address: { postcode: 'SW1A 1AA' },
        backLink: {
          href: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/contact-type',
          text: 'Back'
        },
        redirectUrl: '/system/notices/setup/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/add-recipient'
      }
    }
  })

  it('correctly presents the data', () => {
    const result = ManualPresenter.go(session)

    expect(result).to.equal({
      activeNavBar: 'manage',
      addressLine1: null,
      addressLine2: null,
      addressLine3: null,
      addressLine4: null,
      backLink: {
        href: '/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/postcode',
        text: 'Back'
      },
      pageTitle: 'Enter the address',
      pageTitleCaption: null,
      postcode: 'SW1A 1AA'
    })
  })

  describe('the "addressLine1" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = ManualPresenter.go(session)

        expect(result.addressLine1).to.equal(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.addressLine1 = 'Fake Farm'
      })

      it('returns the set value', () => {
        const result = ManualPresenter.go(session)

        expect(result.addressLine1).to.equal('Fake Farm')
      })
    })
  })

  describe('the "addressLine2" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = ManualPresenter.go(session)

        expect(result.addressLine2).to.equal(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.addressLine2 = '1 Fake Street'
      })

      it('returns the set value', () => {
        const result = ManualPresenter.go(session)

        expect(result.addressLine2).to.equal('1 Fake Street')
      })
    })
  })

  describe('the "addressLine3" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = ManualPresenter.go(session)

        expect(result.addressLine3).to.equal(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.addressLine3 = 'Fake Village'
      })

      it('returns the set value', () => {
        const result = ManualPresenter.go(session)

        expect(result.addressLine3).to.equal('Fake Village')
      })
    })
  })

  describe('the "addressLine4" property', () => {
    describe('when the property has not been set', () => {
      it('returns null', () => {
        const result = ManualPresenter.go(session)

        expect(result.addressLine4).to.equal(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.addressLine4 = 'Fake City'
      })

      it('returns the set value', () => {
        const result = ManualPresenter.go(session)

        expect(result.addressLine4).to.equal('Fake City')
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "select" address page', () => {
      beforeEach(() => {
        session.addressJourney.address.uprn = '123456789'
      })

      it('returns a link to the "select" address page', () => {
        const result = ManualPresenter.go(session)

        expect(result.backLink).to.equal({
          href: '/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/select',
          text: 'Back'
        })
      })
    })

    describe('when the user has not come from the "select" address page', () => {
      it('returns a link to the "postcode" page', () => {
        const result = ManualPresenter.go(session)

        expect(result.backLink).to.equal({
          href: '/system/address/fecd5f15-bacf-4b3d-bdcd-ef279a97b061/postcode',
          text: 'Back'
        })
      })
    })
  })

  describe('the "pageTitleCaption" property', () => {
    describe('when the property has not been configured', () => {
      it('returns null', () => {
        const result = ManualPresenter.go(session)

        expect(result.pageTitleCaption).to.equal(null)
      })
    })

    describe('when the property has been set', () => {
      beforeEach(async () => {
        session.addressJourney.pageTitleCaption = 'Super awesome caption'
      })

      it('returns the set value', () => {
        const result = ManualPresenter.go(session)

        expect(result.pageTitleCaption).to.equal('Super awesome caption')
      })
    })
  })

  describe('the "postcode" property', () => {
    describe('when the property has not been set', () => {
      beforeEach(async () => {
        session.addressJourney.address.postcode = null
      })

      it('returns null', () => {
        const result = ManualPresenter.go(session)

        expect(result.postcode).to.equal(null)
      })
    })

    describe('when the property has been set', () => {
      it('returns the set value', () => {
        const result = ManualPresenter.go(session)

        expect(result.postcode).to.equal('SW1A 1AA')
      })
    })
  })
})
