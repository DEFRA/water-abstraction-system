'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ViewLicencePresenter = require('../../../app/presenters/licences/view-licence.presenter.js')

describe('View Licence presenter', () => {
  let licenceAbstractionConditions
  let licence

  beforeEach(() => {
    licence = _licence()
    licenceAbstractionConditions = _abstractionConditions()
  })

  describe('when provided with a populated licence', () => {
    it('correctly presents the data', () => {
      const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

      expect(result).to.equal({
        id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        abstractionConditionDetails: {
          conditions: ['Derogation clause', 'General conditions', 'Non standard quantities'],
          numberOfConditions: 4
        },
        abstractionPeriods: null,
        abstractionPeriodsAndPurposesLinkText: null,
        abstractionPointLinkText: 'View details of the abstraction point',
        abstractionPoints: ['At National Grid Reference TL 23198 88603'],
        abstractionPointsCaption: 'Point of abstraction',
        abstractionQuantities: null,
        documentId: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb',
        endDate: null,
        licenceHolder: 'Unregistered licence',
        licenceName: 'Unregistered licence',
        licenceRef: '01/123',
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

  describe("the 'abstractionConditionDetails' property", () => {
    describe('when there are multiple abstraction conditions', () => {
      beforeEach(() => {
        licenceAbstractionConditions.conditions = ['Derogation clause', 'General conditions']
        licenceAbstractionConditions.numberOfConditions = 2
      })

      describe('and they have different display titles', () => {
        it('returns the details with plural text and a populated conditions array', () => {
          const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

          expect(result.abstractionConditionDetails).to.equal({
            conditions: ['Derogation clause', 'General conditions'],
            numberOfConditions: 2
          })
        })
      })

      describe('but they have the same title', () => {
        beforeEach(() => {
          licenceAbstractionConditions.conditions = ['Derogation clause']
          licenceAbstractionConditions.numberOfConditions = 2
        })

        it('returns the details with plural text and a populated conditions array', () => {
          const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

          expect(result.abstractionConditionDetails).to.equal({
            conditions: ['Derogation clause'],
            numberOfConditions: 2
          })
        })
      })
    })

    describe('when there is one abstraction condition', () => {
      beforeEach(() => {
        licenceAbstractionConditions.conditions = ['Derogation clause']
        licenceAbstractionConditions.numberOfConditions = 1
      })

      it('returns the details with singular text and a populated conditions array', () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionConditionDetails).to.equal({
          conditions: ['Derogation clause'],
          numberOfConditions: 1
        })
      })
    })

    describe('when there are no abstraction conditions', () => {
      beforeEach(() => {
        licenceAbstractionConditions.conditions = []
        licenceAbstractionConditions.purposeIds = []
        licenceAbstractionConditions.numberOfConditions = 0
      })

      it('returns the details with plural text and an empty conditions array', () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionConditionDetails).to.equal({
          conditions: [],
          numberOfConditions: 0
        })
      })
    })
  })

  describe("the 'endDate' property", () => {
    describe('when the licence expired date is null', () => {
      it('returns NULL', () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.endDate).to.be.null()
      })
    })

    describe('when the licence expired date is set to a date greater than today (2099-04-01)', () => {
      beforeEach(() => {
        licence.expiredDate = new Date('2099-04-01')
      })

      it("returns '1 April 2099'", () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.endDate).to.equal('1 April 2099')
      })
    })
  })

  describe("the 'licenceHolder' property", () => {
    describe('when the licence holder is not set', () => {
      it("returns 'Unregistered licence'", () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.licenceHolder).to.equal('Unregistered licence')
      })
    })

    describe('when the licence holder is set', () => {
      beforeEach(() => {
        licence.licenceHolder = 'Barbara Liskov'
      })

      it("returns 'Barbara Liskov'", () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.licenceHolder).to.equal('Barbara Liskov')
      })
    })
  })

  describe("the 'licenceName' property", () => {
    describe('when there is no licenceName property', () => {
      it('returns Unregistered licence', () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.licenceName).to.equal('Unregistered licence')
      })
    })

    describe('when there is a licenceName property', () => {
      beforeEach(() => {
        licence.licenceName = 'example@example.com'
      })

      it('returns a string with the licence name values', () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.licenceName).to.equal('example@example.com')
      })
    })
  })

  describe("the 'licenceVersionPurposes' property", () => {
    describe('when there are no licenceVersions', () => {
      it('returns null', () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPeriods).to.equal(null)
        expect(result.abstractionPeriodsAndPurposesLinkText).to.equal(null)
      })
    })

    describe('when there are no licenceVersions so an empty array is returned', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns null', () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPeriods).to.equal({
          caption: 'Periods of abstraction',
          uniqueAbstractionPeriods: ['1 January to 28 February', '1 March to 28 April']
        })
      })
    })
  })

  describe("the 'monitoringStations' property", () => {
    describe('when the licence has no gauging stations', () => {
      beforeEach(() => {
        licence.licenceGaugingStations = []
      })

      it('will return an empty array of monitoring station details', async () => {
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.monitoringStations).to.equal([])
      })
    })

    describe("when the licence has a null 'licenceGaugingStations' property", () => {
      beforeEach(() => {
        licence.licenceGaugingStations = null
      })

      it('will return an empty array of monitoring station details', async () => {
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.monitoringStations).to.equal([])
      })
    })

    describe('when the licence has a gauging station', () => {
      it('will return an array populated with monitoring station details', async () => {
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.monitoringStations).to.equal([{
          gaugingStationId: 'ac075651-4781-4e24-a684-b943b98607ca',
          label: 'MEVAGISSEY FIRE STATION'
        }])
      })
    })

    describe('when the licence has multiple gauging stations', () => {
      beforeEach(() => {
        licence.licenceGaugingStations = [{
          gaugingStationId: 'ac075651-4781-4e24-a684-b943b98607ca',
          label: 'MEVAGISSEY FIRE STATION'
        }, {
          gaugingStationId: 'ac075651-4781-4e24-a684-b943b98607cb',
          label: 'AVALON FIRE STATION'
        }]
      })

      it('will return an array populated with multiple monitoring station details', async () => {
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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

  describe("the 'purposes' property", () => {
    describe('when there are no licenceVersions', () => {
      it('returns null', () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.purposes).to.equal(null)
      })
    })

    describe('when there is an empty licenceVersions array', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns null', () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.registeredTo).to.equal(null)
      })
    })

    describe('when there is a registeredTo property', () => {
      beforeEach(() => {
        licence.registeredTo = 'Company'
      })

      it('returns a string with the registered to name', () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.registeredTo).to.equal('Company')
      })
    })
  })

  describe("the 'purposes' property", () => {
    describe('and it has a source of supply', () => {
      it('will return the source of supply for use in the licence summary page', async () => {
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPoints).to.equal(null)
        expect(result.abstractionPointsCaption).to.equal(null)
        expect(result.abstractionPointLinkText).to.equal(null)
        expect(result.abstractionQuantities).to.equal(null)
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
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPoints).to.equal(null)
        expect(result.abstractionPointsCaption).to.equal(null)
        expect(result.abstractionPointLinkText).to.equal(null)
        expect(result.abstractionQuantities).to.equal(null)
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
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPoints).to.equal(null)
        expect(result.abstractionPointsCaption).to.equal(null)
        expect(result.abstractionPointLinkText).to.equal(null)
        expect(result.abstractionQuantities).to.equal(null)
        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it does not have a purposes array', () => {
      beforeEach(() => {
        licence.permitLicence = undefined
      })

      it('will return null for the source of supply and abstraction point information', async () => {
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPoints).to.equal(null)
        expect(result.abstractionPointsCaption).to.equal(null)
        expect(result.abstractionPointLinkText).to.equal(null)
        expect(result.abstractionQuantities).to.equal(null)
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
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPoints).to.equal([
          'At National Grid Reference TL 23198 88603'
        ])
        expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
        expect(result.abstractionPointLinkText).to.equal('View details of the abstraction point')
      })
    })

    describe('and it has abstraction quantities', () => {
      beforeEach(() => {
        licence.permitLicence.purposes[0].ANNUAL_QTY = 265
        licence.permitLicence.purposes[0].DAILY_QTY = 24
        licence.permitLicence.purposes[0].HOURLY_QTY = 60
        licence.permitLicence.purposes[0].INST_QTY = 6
      })

      it('will display the formatted strings with the rates per period and the correct caption', async () => {
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionQuantities).to.equal([
          '265.00 cubic metres per year',
          '24.00 cubic metres per day',
          '60.00 cubic metres per hour',
          '6.00 litres per second'
        ])
      })
    })

    describe('and it has one abstraction quantity', () => {
      beforeEach(() => {
        licence.permitLicence.purposes[0].ANNUAL_QTY = 265
      })

      it('will display the formatted string with the rate per period and the correct caption', async () => {
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionQuantities).to.equal([
          '265.00 cubic metres per year'
        ])
      })
    })

    describe('and it has abstraction ANNUAL_QTY and DAILY_QTY set to null', () => {
      beforeEach(() => {
        licence.permitLicence.purposes[0].ANNUAL_QTY = 'null'
        licence.permitLicence.purposes[0].DAILY_QTY = 'null'
        licence.permitLicence.purposes[0].HOURLY_QTY = 60
        licence.permitLicence.purposes[0].INST_QTY = 6
      })

      it('will display the formatted string with the rate per period and the correct caption', async () => {
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionQuantities).to.equal([
          '60.00 cubic metres per hour',
          '6.00 litres per second'
        ])
      })
    })

    describe('and it has abstraction DAILY_QTY set to null', () => {
      beforeEach(() => {
        licence.permitLicence.purposes[0].ANNUAL_QTY = 'null'
        licence.permitLicence.purposes[0].DAILY_QTY = 'null'
        licence.permitLicence.purposes[0].HOURLY_QTY = 'null'
        licence.permitLicence.purposes[0].INST_QTY = 6
      })

      it('will display the formatted string with the rate per period and the correct caption', async () => {
        const result = await ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionQuantities).to.equal([
          '6.00 litres per second'
        ])
      })
    })
  })

  describe("the 'warning' property", () => {
    describe('when the licence does not have an end date (expired, lapsed or revoked)', () => {
      it('returns NULL', () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.warning).to.be.null()
      })
    })

    describe('when the licence does have an end date but it is in the future (expired, lapsed or revoked)', () => {
      beforeEach(() => {
        licence.expiredDate = new Date('2099-04-01')
      })

      it('returns NULL', () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.warning).to.be.null()
      })
    })

    describe('when the licence ends today or in the past (2019-04-01) because it is expired', () => {
      beforeEach(() => {
        licence.ends = { date: new Date('2019-04-01'), reason: 'expired' }
      })

      it("returns 'This licence expired on 1 April 2019'", () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.warning).to.equal('This licence expired on 1 April 2019')
      })
    })

    describe('when the licence ends today or in the past (2019-04-01) because it is lapsed', () => {
      beforeEach(() => {
        licence.ends = { date: new Date('2019-04-01'), reason: 'lapsed' }
      })

      it("returns 'This licence lapsed on 1 April 2019'", () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.warning).to.equal('This licence lapsed on 1 April 2019')
      })
    })

    describe('when the licence was ends today or in the past (2019-04-01) because it is revoked', () => {
      beforeEach(() => {
        licence.ends = { date: new Date('2019-04-01'), reason: 'revoked' }
      })

      it("returns 'This licence was revoked on 1 April 2019'", () => {
        const result = ViewLicencePresenter.go(licence, licenceAbstractionConditions)

        expect(result.warning).to.equal('This licence was revoked on 1 April 2019')
      })
    })
  })
})

function _abstractionConditions () {
  return {
    conditions: ['Derogation clause', 'General conditions', 'Non standard quantities'],
    purposeIds: ['63de1a43-209b-448c-ae30-a3ca458a9cc2', '6e9744c8-e0ae-4a22-95b4-e689b776c902'],
    numberOfConditions: 4
  }
}

function _licence () {
  return {
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
        ANNUAL_QTY: 'null',
        DAILY_QTY: 'null',
        HOURLY_QTY: 'null',
        INST_QTY: 'null',
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
}
