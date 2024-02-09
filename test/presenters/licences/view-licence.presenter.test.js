'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicencePresenter = require('../../../app/presenters/licences/view-licence.presenter.js')

describe('View Licence presenter', () => {
  let licence

  beforeEach(() => {
    licence = {
      id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
      ends: null,
      expiredDate: null,
      licenceDocumentHeader: { id: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb' },
      licenceHolder: null,
      licenceRef: '01/123',
      region: { displayName: 'Narnia' },
      startDate: new Date('2019-04-01')
    }
  })

  describe('when provided with a populated licence', () => {
    it('correctly presents the data', () => {
      const result = ViewLicencePresenter.go(licence)

      expect(result).to.equal({
        abstractionPeriods: null,
        abstractionPeriodsAndPurposesLinkText: null,
        id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        documentId: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb',
        endDate: null,
        licenceHolder: 'Unregistered licence',
        licenceRef: '01/123',
        pageTitle: 'Licence 01/123',
        purposes: null,
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

    describe("the 'licenceHolder' property", () => {
      describe('when the licence holder is not set', () => {
        it("returns 'Unregistered licence'", () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.licenceHolder).to.equal('Unregistered licence')
        })
      })

      describe('when the licence holder is set', () => {
        beforeEach(() => {
          licence.licenceHolder = 'Barbara Liskov'
        })

        it("returns 'Barbara Liskov'", () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.licenceHolder).to.equal('Barbara Liskov')
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

      describe('when the licence ends today or in the past (2019-04-01) because it is expired', () => {
        beforeEach(() => {
          licence.ends = { date: new Date('2019-04-01'), reason: 'expired' }
        })

        it("returns 'This licence expired on 1 April 2019'", () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.warning).to.equal('This licence expired on 1 April 2019')
        })
      })

      describe('when the licence ends today or in the past (2019-04-01) because it is lapsed', () => {
        beforeEach(() => {
          licence.ends = { date: new Date('2019-04-01'), reason: 'lapsed' }
        })

        it("returns 'This licence lapsed on 1 April 2019'", () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.warning).to.equal('This licence lapsed on 1 April 2019')
        })
      })

      describe('when the licence was ends today or in the past (2019-04-01) because it is revoked', () => {
        beforeEach(() => {
          licence.ends = { date: new Date('2019-04-01'), reason: 'revoked' }
        })

        it("returns 'This licence was revoked on 1 April 2019'", () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.warning).to.equal('This licence was revoked on 1 April 2019')
        })
      })
    })

    describe("the 'purposes' property", () => {
      describe('when there are no licenceVersions', () => {
        it('returns null', () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.purposes).to.equal(null)
        })
      })

      describe('when the licenceVersions has one purpose', () => {
        beforeEach(() => {
          licence.licenceVersions = [{
            purposes: [{
              description: 'Spray Irrigation - Storage'
            }]
          }]
        })

        it('returns an object with a caption and an array with one purpose', () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.purposes).to.equal({
            caption: 'Purpose',
            data: ['Spray Irrigation - Storage']
          })
        })
      })

      describe('when the licenceVersions has more than one purpose of the same type', () => {
        beforeEach(() => {
          licence.licenceVersions = [{
            purposes: [{
              description: 'Spray Irrigation - Storage'
            }, {
              description: 'Spray Irrigation - Storage'
            }]
          }]
        })

        it('returns an object with a caption and an array with one purpose', () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.purposes).to.equal({
            caption: 'Purpose',
            data: ['Spray Irrigation - Storage']
          })
        })
      })

      describe('when the licenceVersions has more than one purpose of different types', () => {
        beforeEach(() => {
          licence.licenceVersions = [{
            purposes: [{
              description: 'Spray Irrigation - Storage'
            }, {
              description: 'Make-Up Or Top Up Water'
            }]
          }]
        })

        it('returns an object with a caption and an array with two purposes', () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.purposes).to.equal({
            caption: 'Purposes',
            data: ['Spray Irrigation - Storage', 'Make-Up Or Top Up Water']
          })
        })
      })
    })

    describe("the 'licenceVersionPurposes' property", () => {
      describe('when there are no licenceVersions', () => {
        it('returns null', () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.abstractionPeriods).to.equal(null)
          expect(result.abstractionPeriodsAndPurposesLinkText).to.equal(null)
        })
      })

      describe('when the licenceVersionPurposes has one abstraction period', () => {
        beforeEach(() => {
          licence.licenceVersions = [{
            licenceVersionPurposes: [{
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1,
              abstractionPeriodEndDay: 28,
              abstractionPeriodEndMonth: 2
            }]
          }]
        })

        it('returns an object with a caption and an array with one abstraction period', () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.abstractionPeriods).to.equal({
            caption: 'Period of abstraction',
            uniqueAbstractionPeriods: ['1 January to 28 February']
          })
        })
      })

      describe('when the licenceVersions has more than one abstraction period of the same range', () => {
        beforeEach(() => {
          licence.licenceVersions = [{
            licenceVersionPurposes: [{
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1,
              abstractionPeriodEndDay: 28,
              abstractionPeriodEndMonth: 2
            }, {
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1,
              abstractionPeriodEndDay: 28,
              abstractionPeriodEndMonth: 2
            }]
          }]
        })

        it('returns an object with a caption and an array with one abstraction period', () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.abstractionPeriods).to.equal({
            caption: 'Period of abstraction',
            uniqueAbstractionPeriods: ['1 January to 28 February']
          })
        })
      })

      describe('when the licenceVersions has more than one purpose of different types', () => {
        beforeEach(() => {
          licence.licenceVersions = [{
            licenceVersionPurposes: [{
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1,
              abstractionPeriodEndDay: 28,
              abstractionPeriodEndMonth: 2
            }, {
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 3,
              abstractionPeriodEndDay: 28,
              abstractionPeriodEndMonth: 4
            }]
          }]
        })

        it('returns an object with a caption and an array with two purposes', () => {
          const result = ViewLicencePresenter.go(licence)

          expect(result.abstractionPeriods).to.equal({
            caption: 'Periods of abstraction',
            uniqueAbstractionPeriods: ['1 January to 28 February', '1 March to 28 April']
          })
        })
      })
    })
  })
})
