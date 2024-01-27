'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')

// Thing under test
const ViewLicencePresenter = require('../../../app/presenters/licences/view-licence.presenter.js')

describe('View Licence presenter', () => {
  let licence

  beforeEach(() => {
    licence = LicenceModel.fromJson({
      id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
      expiredDate: null,
      licenceRef: '01/123',
      region: { displayName: 'Narnia' },
      startDate: new Date('2019-04-01')
    })
  })

  describe('when provided with a populated licence', () => {
    it('correctly presents the data', () => {
      const result = ViewLicencePresenter.go(licence)

      expect(result).to.equal({
        id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        endDate: null,
        licenceRef: '01/123',
        pageTitle: 'Licence 01/123',
        region: 'Narnia',
        startDate: '1 April 2019',
        warning: null
      })
    })

    describe("the 'endDate' property", () => {
      describe('when the licence expired date is null', () => {
        it('returns NULL', () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.endDate).to.be.null()
        })
      })

      describe('when the licence expired date is set to a date less than or equal to today', () => {
        beforeEach(() => {
          // NOTE: The date we get back from the DB is without time. If we just assigned new Date() to expiredDate
          // there is a chance the test could fail depending on how quickly this is compared to the logic in the
          // presenter
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          licence.expiredDate = today
        })

        it('returns NULL', () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.endDate).to.be.null()
        })
      })

      describe('when the licence expired date is set to a date greater than today (2099-04-01)', () => {
        beforeEach(() => {
          licence.expiredDate = new Date('2099-04-01')
        })

        it("returns '1 April 2099'", () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.endDate).to.equal('1 April 2099')
        })
      })
    })

    describe("the 'warning' property", () => {
      describe('when the licence does not have an end date (expired, lapsed or revoked)', () => {
        it('returns NULL', () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.warning).to.be.null()
        })
      })

      describe('when the licence does have an end date but it is in the future (expired, lapsed or revoked)', () => {
        beforeEach(() => {
          licence.expiredDate = new Date('2099-04-01')
        })

        it('returns NULL', () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.warning).to.be.null()
        })
      })

      describe('when the licence expired today or in the past (2019-04-01)', () => {
        beforeEach(() => {
          licence.expiredDate = new Date('2019-04-01')
        })

        it("returns 'This licence expired on 1 April 2019'", () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.warning).to.equal('This licence expired on 1 April 2019')
        })
      })

      describe('when the licence lapsed today or in the past (2019-04-01)', () => {
        beforeEach(() => {
          licence.lapsedDate = new Date('2019-04-01')
        })

        it("returns 'This licence lapsed on 1 April 2019'", () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.warning).to.equal('This licence lapsed on 1 April 2019')
        })
      })

      describe('when the licence was revoked today or in the past (2019-04-01)', () => {
        beforeEach(() => {
          licence.revokedDate = new Date('2019-04-01')
        })

        it("returns 'This licence was revoked on 1 April 2019'", () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.warning).to.equal('This licence was revoked on 1 April 2019')
        })
      })
    })
  })
})
