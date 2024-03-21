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
      licenceGaugingStations: [{
        gaugingStationId: 'ac075651-4781-4e24-a684-b943b98607ca',
        label: 'MEVAGISSEY FIRE STATION'
      }],
      licenceHolder: null,
      licenceName: 'Unregistered licence',
      licenceRef: '01/123',
      permitLicence: {
        purposes: [{
          purposePoints: [{
            point_detail: {
              NGR1_SHEET: 'TL',
              NGR1_EAST: '23198',
              NGR1_NORTH: '88603'
            },
            point_source: {
              NAME: 'SURFACE WATER SOURCE OF SUPPLY'
            }
          }]
        }]
      },
      region: { displayName: 'Narnia' },
      registeredTo: null,
      startDate: new Date('2019-04-01')
    }
  })

  describe('when provided with a populated licence', () => {
    it('correctly presents the data', () => {
      const result = ViewLicencePresenter.go(licence)

      expect(result).to.equal({
        abstractionConditions: {
          caption: 'Abstraction condition',
          conditions: [],
          linkText: 'View details of the abstraction condition'
        },
        abstractionPeriods: null,
        abstractionPeriodsAndPurposesLinkText: null,
        abstractionPointLinkText: 'View details of the abstraction point',
        abstractionPoints: ['At National Grid Reference TL 23198 88603'],
        abstractionPointsCaption: 'Point of abstraction',
        id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        documentId: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb',
        endDate: null,
        licenceHolder: 'Unregistered licence',
        licenceName: 'Unregistered licence',
        licenceRef: '01/123',
        monitoringStationCaption: 'Monitoring station',
        monitoringStations: [{
          gaugingStationId: 'ac075651-4781-4e24-a684-b943b98607ca',
          label: 'MEVAGISSEY FIRE STATION'
        }],
        pageTitle: 'Licence 01/123',
        purposes: null,
        registeredTo: null,
        region: 'Narnia',
        sourceOfSupply: 'SURFACE WATER SOURCE OF SUPPLY',
        startDate: '1 April 2019',
        warning: null
      })
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

    describe('when there is an empty licenceVersions array', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns null', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.purposes).to.equal(null)
      })
    })

    describe('when there is an empty licenceVersions purposes array', () => {
      beforeEach(() => {
        licence.licenceVersions = [{
          purposes: []
        }]
      })

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

      it('returns an object with a caption and an array with one entry', () => {
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

      it('returns an object with a caption and an array with two entries', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.purposes).to.equal({
          caption: 'Purposes',
          data: ['Spray Irrigation - Storage', 'Make-Up Or Top Up Water']
        })
      })
    })
  })

  describe("the 'registeredTo' property", () => {
    describe('when there is no registeredTo property', () => {
      it('returns null', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.registeredTo).to.equal(null)
      })
    })

    describe('when there is a registeredTo property', () => {
      beforeEach(() => {
        licence.registeredTo = 'Company'
      })

      it('returns a string with the registered to name', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.registeredTo).to.equal('Company')
      })
    })
  })

  describe("the 'licenceName' property", () => {
    describe('when there is no licenceName property', () => {
      it('returns Unregistered licence', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.licenceName).to.equal('Unregistered licence')
      })
    })

    describe('when there is a licenceName property', () => {
      beforeEach(() => {
        licence.licenceName = 'example@example.com'
      })

      it('returns a string with the licence name valus', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.licenceName).to.equal('example@example.com')
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

    describe('when there are no licenceVersions so an empty array is returned', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns null', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.abstractionPeriods).to.equal(null)
        expect(result.abstractionPeriodsAndPurposesLinkText).to.equal(null)
      })
    })

    describe('when the licenceVersionPurposes has no abstraction period and one purpose', () => {
      beforeEach(() => {
        licence.licenceVersions = [{
          purposes: [{
            description: 'Spray Irrigation - Storage'
          }],
          licenceVersionPurposes: []
        }]
      })

      it('returns null', () => {
        const result = ViewLicencePresenter.go(licence)

        expect(result.abstractionPeriods).to.equal(null)
      })
    })

    describe('when the licenceVersionPurposes has one abstraction period and one purpose', () => {
      beforeEach(() => {
        licence.licenceVersions = [{
          purposes: [{
            description: 'Spray Irrigation - Storage'
          }],
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

    describe('when the licenceVersions has more than one abstraction period and purposes of different types', () => {
      beforeEach(() => {
        licence.licenceVersions = [{
          purposes: [{
            description: 'Spray Irrigation - Storage'
          }, {
            description: 'Make-Up Or Top Up Water'
          }],
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

  describe("the 'purposes' property", () => {
    describe('and it has a source of supply', () => {
      it('will return the source of supply for use in the licence summary page', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.sourceOfSupply).to.equal('SURFACE WATER SOURCE OF SUPPLY')
      })
    })

    describe('and it does not have a source of supply name', () => {
      beforeEach(() => {
        licence.permitLicence = {
          purposes: [{
            purposePoints: [{
              point_source: {}
            }]
          }]
        }
      })

      it('will return null for the source of supply', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it does not have a source of supply point_source or point_detail', () => {
      beforeEach(() => {
        licence.permitLicence = {
          purposes: [{
            purposePoints: [{}]
          }]
        }
      })

      it('will return null for the source of supply and abstraction point information', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.abstractionPoints).to.equal(null)
        expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
        expect(result.abstractionPointLinkText).to.equal('View details of the abstraction point')
        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it has an empty purposePoints array', () => {
      beforeEach(() => {
        licence.permitLicence = {
          purposes: [{
            purposePoints: []
          }]
        }
      })

      it('will return null for the source of supply and abstraction point information', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.abstractionPoints).to.equal(null)
        expect(result.abstractionPointsCaption).to.equal(null)
        expect(result.abstractionPointLinkText).to.equal(null)
        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it does not have a purposePoints array', () => {
      beforeEach(() => {
        licence.permitLicence = {
          purposes: [{}]
        }
      })

      it('will return null for the source of supply and abstraction point information', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.abstractionPoints).to.equal(null)
        expect(result.abstractionPointsCaption).to.equal(null)
        expect(result.abstractionPointLinkText).to.equal(null)
        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it has an empty purposes array', () => {
      beforeEach(() => {
        licence.permitLicence = {
          purposes: []
        }
      })

      it('will return null for the source of supply and abstraction point information', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.abstractionPoints).to.equal(null)
        expect(result.abstractionPointsCaption).to.equal(null)
        expect(result.abstractionPointLinkText).to.equal(null)
        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it does not have a purposes array', () => {
      beforeEach(() => {
        licence.permitLicence = undefined
      })

      it('will return null for the source of supply and abstraction point information', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.abstractionPoints).to.equal(null)
        expect(result.abstractionPointsCaption).to.equal(null)
        expect(result.abstractionPointLinkText).to.equal(null)
        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it has an abstraction point with 4 national grid references', () => {
      beforeEach(() => {
        licence.permitLicence.purposes[0].purposePoints[0].point_detail = {
          NGR1_SHEET: 'TL',
          NGR2_SHEET: 'TM',
          NGR3_SHEET: 'TN',
          NGR4_SHEET: 'TO',
          NGR1_EAST: '23198',
          NGR2_EAST: '23197',
          NGR3_EAST: '23196',
          NGR4_EAST: '23195',
          NGR1_NORTH: '88603',
          NGR2_NORTH: '88602',
          NGR3_NORTH: '88601',
          NGR4_NORTH: '88600'
        }
      })

      it('will return the information for the abstraction point', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.abstractionPoints).to.equal([
          'Within the area formed by the straight lines running between National Grid References TL 23198 88603 TM 23197 88602 TN 23196 88601 and TO 23195 88600'
        ])
        expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
        expect(result.abstractionPointLinkText).to.equal('View details of the abstraction point')
      })
    })

    describe('and it has an abstraction point with 2 national grid references', () => {
      beforeEach(() => {
        licence.permitLicence.purposes[0].purposePoints[0].point_detail = {
          NGR1_SHEET: 'TL',
          NGR2_SHEET: 'TM',
          NGR1_EAST: '23198',
          NGR2_EAST: '23197',
          NGR1_NORTH: '88603',
          NGR2_NORTH: '88602'
        }
      })

      it('will return the information for the abstraction point', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.abstractionPoints).to.equal([
          'Between National Grid References TL 23198 88603 and TM 23197 88602'
        ])
        expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
        expect(result.abstractionPointLinkText).to.equal('View details of the abstraction point')
      })
    })

    describe('and it has an abstraction point with 1 national grid references', () => {
      beforeEach(() => {
        licence.permitLicence.purposes[0].purposePoints[0].point_detail = {
          NGR1_SHEET: 'TL',
          NGR1_EAST: '23198',
          NGR1_NORTH: '88603'
        }
      })

      it('will return the information for the abstraction point', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.abstractionPoints).to.equal([
          'At National Grid Reference TL 23198 88603'
        ])
        expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
        expect(result.abstractionPointLinkText).to.equal('View details of the abstraction point')
      })
    })

    describe('and it has an abstraction point with 1 national grid references and has a local name', () => {
      beforeEach(() => {
        licence.permitLicence.purposes[0].purposePoints[0].point_detail = {
          LOCAL_NAME: 'Local',
          NGR1_SHEET: 'TL',
          NGR1_EAST: '23198',
          NGR1_NORTH: '88603'
        }
      })

      it('will return the information for the abstraction point', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.abstractionPoints).to.equal([
          'At National Grid Reference TL 23198 88603 (Local)'
        ])
        expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
        expect(result.abstractionPointLinkText).to.equal('View details of the abstraction point')
      })
    })

    describe('and it has two abstraction points with 1 national grid references', () => {
      beforeEach(() => {
        licence.permitLicence.purposes[0].purposePoints[0].point_detail = {
          NGR1_SHEET: 'TL',
          NGR1_EAST: '23198',
          NGR1_NORTH: '88603'
        }
        licence.permitLicence.purposes[0].purposePoints.push({
          point_detail: {
            NGR1_SHEET: 'TM',
            NGR1_EAST: '23199',
            NGR1_NORTH: '88604'
          }
        })
      })

      it('will return the information for the abstraction point', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.abstractionPoints).to.equal([
          'At National Grid Reference TL 23198 88603',
          'At National Grid Reference TM 23199 88604'
        ])
        expect(result.abstractionPointsCaption).to.equal('Points of abstraction')
        expect(result.abstractionPointLinkText).to.equal('View details of the abstraction points')
      })
    })

    describe('and it has two abstraction points with the same 1 national grid references', () => {
      beforeEach(() => {
        licence.permitLicence.purposes[0].purposePoints[0].point_detail = {
          NGR1_SHEET: 'TL',
          NGR1_EAST: '23198',
          NGR1_NORTH: '88603'
        }
        licence.permitLicence.purposes[0].purposePoints.push({
          point_detail: {
            NGR1_SHEET: 'TL',
            NGR1_EAST: '23198',
            NGR1_NORTH: '88603'
          }
        })
      })

      it('will only display one of the abstraction point', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.abstractionPoints).to.equal([
          'At National Grid Reference TL 23198 88603'
        ])
        expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
        expect(result.abstractionPointLinkText).to.equal('View details of the abstraction point')
      })
    })
  })

  describe("the 'licenceGaugingStations' property", () => {
    describe('and it has no monitoring station', () => {
      beforeEach(() => {
        licence.licenceGaugingStations = []
      })

      it('will return the correct caption and an empty arrary of objects for use in the licence summary page', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.monitoringStationCaption).to.equal('Monitoring station')
        expect(result.monitoringStations).to.equal([])
      })
    })

    describe('and it has null for licenceGaugingStations', () => {
      beforeEach(() => {
        licence.licenceGaugingStations = null
      })

      it('will return the correct caption and an empty arrary of objects for use in the licence summary page', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.monitoringStationCaption).to.equal('Monitoring station')
        expect(result.monitoringStations).to.equal([])
      })
    })

    describe('and it has a monitoring station', () => {
      it('will return the correct caption and arrary of objects for use in the licence summary page', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.monitoringStationCaption).to.equal('Monitoring station')
        expect(result.monitoringStations).to.equal([{
          gaugingStationId: 'ac075651-4781-4e24-a684-b943b98607ca',
          label: 'MEVAGISSEY FIRE STATION'
        }])
      })
    })

    describe('and it has two monitoring stations', () => {
      beforeEach(() => {
        licence.licenceGaugingStations = [{
          gaugingStationId: 'ac075651-4781-4e24-a684-b943b98607ca',
          label: 'MEVAGISSEY FIRE STATION'
        }, {
          gaugingStationId: 'ac075651-4781-4e24-a684-b943b98607cb',
          label: 'AVALON FIRE STATION'
        }]
      })

      it('will return the correct caption and arrary of objects for use in the licence summary page', async () => {
        const result = await ViewLicencePresenter.go(licence)

        expect(result.monitoringStationCaption).to.equal('Monitoring stations')
        expect(result.monitoringStations).to.equal([{
          gaugingStationId: 'ac075651-4781-4e24-a684-b943b98607ca',
          label: 'MEVAGISSEY FIRE STATION'
        }, {
          gaugingStationId: 'ac075651-4781-4e24-a684-b943b98607cb',
          label: 'AVALON FIRE STATION'
        }])
      })
    })
  })

  describe("the 'abstractionConditions' property", () => {
    describe('and it has no abstraction conditions', () => {
      it('will return the correct caption, link text and an empty arrary for use in the licence summary page', async () => {
        const result = await ViewLicencePresenter.go(licence, [])

        expect(result.abstractionConditions.caption).to.equal('Abstraction condition')
        expect(result.abstractionConditions.linkText).to.equal('View details of the abstraction condition')
        expect(result.abstractionConditions.conditions).to.equal([])
      })
    })

    describe('and it has one abstraction condition', () => {
      const abstractionCondtion = {
        numberOfAbstractionConditions: 1,
        uniqueAbstractionConditions: ['Level cessation condition']
      }

      it('will return the correct caption and an empty arrary of objects for use in the licence summary page', async () => {
        const result = await ViewLicencePresenter.go(licence, abstractionCondtion)

        expect(result.abstractionConditions.caption).to.equal('Abstraction condition')
        expect(result.abstractionConditions.linkText).to.equal('View details of the abstraction condition')
        expect(result.abstractionConditions.conditions).to.equal(['Level cessation condition'])
        expect(result.abstractionConditions.numberOfAbstractionConditions).to.equal(1)
      })
    })

    describe('and it has two abstraction conditions', () => {
      const abstractionCondtion = {
        numberOfAbstractionConditions: 2,
        uniqueAbstractionConditions: ['Level cessation condition', 'Cessation dependant on releases from schemes / other licences']
      }

      it('will return the correct caption and an empty arrary of objects for use in the licence summary page', async () => {
        const result = await ViewLicencePresenter.go(licence, abstractionCondtion)

        expect(result.abstractionConditions.caption).to.equal('Abstraction conditions')
        expect(result.abstractionConditions.linkText).to.equal('View details of the abstraction conditions')
        expect(result.abstractionConditions.conditions).to.equal(['Level cessation condition', 'Cessation dependant on releases from schemes / other licences'])
        expect(result.abstractionConditions.numberOfAbstractionConditions).to.equal(2)
      })
    })
  })
})
