'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')

// Thing under test
const ViewLicenceSummaryPresenter = require('../../../app/presenters/licences/view-licence-summary.presenter.js')

describe('View Licence Summary presenter', () => {
  let licenceAbstractionConditions
  let licence

  beforeEach(() => {
    licence = _licence()
    licenceAbstractionConditions = _abstractionConditions()
  })

  describe('when provided with a populated licence', () => {
    it('correctly presents the data', () => {
      const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

      expect(result).to.equal({
        abstractionConditionDetails: {
          conditions: ['Derogation clause', 'General conditions', 'Non standard quantities'],
          numberOfConditions: 4
        },
        abstractionPeriods: {
          caption: 'Periods of abstraction',
          uniqueAbstractionPeriods: ['1 April to 31 October', '1 November to 31 March']
        },
        abstractionPeriodsAndPurposesLinkText: 'View details of your purposes, periods and amounts',
        abstractionPointLinkText: 'View details of the abstraction point',
        abstractionPoints: ['At National Grid Reference TL 23198 88603'],
        abstractionPointsCaption: 'Point of abstraction',
        abstractionQuantities: null,
        activeTab: 'summary',
        documentId: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb',
        endDate: null,
        id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        licenceHolder: 'Unregistered licence',
        monitoringStations: [{
          id: 'ac075651-4781-4e24-a684-b943b98607ca',
          label: 'MEVAGISSEY FIRE STATION'
        }],
        purposes: {
          caption: 'Purposes',
          data: ['Spray Irrigation - Storage', 'Spray Irrigation - Direct']
        },
        region: 'Avalon',
        sourceOfSupply: 'SURFACE WATER SOURCE OF SUPPLY',
        startDate: '1 April 2019'
      })
    })
  })

  describe('the "abstractionConditionDetails" property', () => {
    describe('when there are multiple abstraction conditions', () => {
      beforeEach(() => {
        licenceAbstractionConditions.conditions = ['Derogation clause', 'General conditions']
        licenceAbstractionConditions.numberOfConditions = 2
      })

      describe('and they have different display titles', () => {
        it('returns the details with plural text and a populated conditions array', () => {
          const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
          const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionConditionDetails).to.equal({
          conditions: [],
          numberOfConditions: 0
        })
      })
    })
  })

  describe('the "abstractionPeriods" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns null', () => {
        const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPeriods).to.equal(null)
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns null', () => {
          const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

          expect(result.abstractionPeriods).to.equal(null)
        })
      })

      describe('and a single licence version purpose linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes.pop()
          licence.licenceVersions[0].licenceVersionPurposes.pop()
        })

        it('returns the singular version of the caption and period formatted for display', () => {
          const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

          expect(result.abstractionPeriods).to.equal({
            caption: 'Period of abstraction',
            uniqueAbstractionPeriods: ['1 April to 31 October']
          })
        })
      })

      describe('and multiple licence version purposes linked to it', () => {
        describe('that all have different abstraction periods', () => {
          beforeEach(() => {
            licence.licenceVersions[0].licenceVersionPurposes.pop()
          })

          it('returns the plural version of the caption and periods formatted for display', () => {
            const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

            expect(result.abstractionPeriods).to.equal({
              caption: 'Periods of abstraction',
              uniqueAbstractionPeriods: ['1 April to 31 October', '1 November to 31 March']
            })
          })
        })

        describe('that have some abstraction periods that are the same', () => {
          it('returns the plural version of the caption and the unique periods formatted for display', () => {
            const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

            expect(result.abstractionPeriods).to.equal({
              caption: 'Periods of abstraction',
              uniqueAbstractionPeriods: ['1 April to 31 October', '1 November to 31 March']
            })
          })
        })
      })
    })
  })

  describe('the "abstractionPeriodsAndPurposesLinkText" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns null', () => {
        const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPeriodsAndPurposesLinkText).to.equal(null)
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns null', () => {
          const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

          expect(result.abstractionPeriodsAndPurposesLinkText).to.equal(null)
        })
      })

      describe('and a single licence version purpose linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes.pop()
          licence.licenceVersions[0].licenceVersionPurposes.pop()
        })

        it('returns the singular version of the link (period and purpose)', () => {
          const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

          expect(result.abstractionPeriodsAndPurposesLinkText)
            .to
            .equal('View details of your purpose, period and amounts')
        })
      })

      describe('and multiple licence version purposes linked to it', () => {
        describe('that all have different abstraction periods', () => {
          describe('but the same purpose', () => {
            beforeEach(() => {
              licence.licenceVersions[0].licenceVersionPurposes.pop()
            })

            it('returns a mixed version of the link (periods and purpose)', () => {
              const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

              expect(result.abstractionPeriodsAndPurposesLinkText)
                .to
                .equal('View details of your purpose, periods and amounts')
            })
          })

          describe('and different purposes', () => {
            beforeEach(() => {
              licence.licenceVersions[0].licenceVersionPurposes.pop()
              licence.licenceVersions[0].licenceVersionPurposes[1].purpose = {
                id: 'd1fc1c6f-bff0-4da2-a41a-033f151fddc7', description: 'Spray Irrigation - Direct'
              }
            })

            it('returns the plural version of the link (periods and purposes)', () => {
              const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

              expect(result.abstractionPeriodsAndPurposesLinkText)
                .to
                .equal('View details of your purposes, periods and amounts')
            })
          })
        })

        describe('that all have the same abstraction period', () => {
          beforeEach(() => {
            licence.licenceVersions[0].licenceVersionPurposes.splice(1, 1)
          })

          describe('and the same purpose', () => {
            beforeEach(() => {
              licence.licenceVersions[0].licenceVersionPurposes[1].purpose = {
                id: '0316229a-e76d-4785-bc2c-65075a1a8f50', description: 'Spray Irrigation - Storage'
              }
            })

            it('returns the singular version of the link (period and purpose)', () => {
              const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

              expect(result.abstractionPeriodsAndPurposesLinkText)
                .to
                .equal('View details of your purpose, period and amounts')
            })
          })

          describe('but different purposes', () => {
            it('returns a mixed version of the link (period and purposes)', () => {
              const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

              expect(result.abstractionPeriodsAndPurposesLinkText)
                .to
                .equal('View details of your purposes, period and amounts')
            })
          })
        })
      })
    })
  })

  describe('the "endDate" property', () => {
    describe('when the licence expired date is null', () => {
      it('returns null', () => {
        const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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

      it('returns null', () => {
        const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.endDate).to.be.null()
      })
    })

    describe('when the licence expired date is set to a date greater than today (2099-04-01)', () => {
      beforeEach(() => {
        licence.expiredDate = new Date('2099-04-01')
      })

      it('returns "1 April 2099"', () => {
        const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.endDate).to.equal('1 April 2099')
      })
    })
  })

  describe('the "licenceHolder" property', () => {
    describe('when the licence holder is not set', () => {
      it('returns "Unregistered licence"', () => {
        const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.licenceHolder).to.equal('Unregistered licence')
      })
    })

    describe('when the licence holder is set', () => {
      beforeEach(() => {
        // We 'mimic' licenceDocument containing a ContactModel instance that is populated. If it was the call to its
        // instance method $name() would return the contact's name. We pretend in order to test the logic in the
        // presenter
        const contact = {
          $name: () => { return 'Barbara Liskov' }
        }

        licence.licenceDocument = {
          licenceDocumentRoles: [{ contact }]
        }
      })

      it('returns "Barbara Liskov"', () => {
        const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.licenceHolder).to.equal('Barbara Liskov')
      })
    })
  })

  describe('the "monitoringStations" property', () => {
    describe('when the licence has no gauging stations', () => {
      beforeEach(() => {
        licence.licenceGaugingStations = []
      })

      it('will return an empty array', async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.monitoringStations).to.equal([])
      })
    })

    describe('when the licence has a gauging station', () => {
      it('will return any array with the monitoring station details', async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.monitoringStations).to.equal([{
          id: 'ac075651-4781-4e24-a684-b943b98607ca',
          label: 'MEVAGISSEY FIRE STATION'
        }])
      })
    })

    describe('when the licence has multiple gauging stations', () => {
      beforeEach(() => {
        licence.licenceGaugingStations.push({
          id: '13f7504d-2750-4dd9-94dd-929e99e900a0',
          gaugingStation: {
            id: '4a6493b0-1d8d-429f-a7a0-3a6541d5ff1f',
            label: 'AVALON FIRE STATION'
          }
        })
      })

      it('will return any array with the monitoring station details', async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.monitoringStations).to.equal([
          {
            id: 'ac075651-4781-4e24-a684-b943b98607ca',
            label: 'MEVAGISSEY FIRE STATION'
          },
          {
            id: '4a6493b0-1d8d-429f-a7a0-3a6541d5ff1f',
            label: 'AVALON FIRE STATION'
          }
        ])
      })
    })
  })

  describe('the "purposes" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        licence.licenceVersions = []
      })

      it('returns null', () => {
        const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.purposes).to.equal(null)
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns null', () => {
          const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

          expect(result.purposes).to.equal(null)
        })
      })

      describe('and a single licence version purpose linked to it', () => {
        beforeEach(() => {
          licence.licenceVersions[0].licenceVersionPurposes.pop()
          licence.licenceVersions[0].licenceVersionPurposes.pop()
        })

        it('returns the singular version of the caption and the purpose descriptions', () => {
          const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

          expect(result.purposes).to.equal({
            caption: 'Purpose',
            data: ['Spray Irrigation - Storage']
          })
        })
      })

      describe('and multiple licence version purposes linked to it', () => {
        describe('that all have different purposes', () => {
          beforeEach(() => {
            licence.licenceVersions[0].licenceVersionPurposes.splice(1, 1)
          })

          it('returns the plural version of the caption and all purpose descriptions', () => {
            const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

            expect(result.purposes).to.equal({
              caption: 'Purposes',
              data: ['Spray Irrigation - Storage', 'Spray Irrigation - Direct']
            })
          })
        })

        describe('that have some abstraction purposes that are the same', () => {
          it('returns the plural version of the captions and the unique purpose descriptions', () => {
            const result = ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

            expect(result.purposes).to.equal({
              caption: 'Purposes',
              data: ['Spray Irrigation - Storage', 'Spray Irrigation - Direct']
            })
          })
        })
      })
    })
  })

  describe('the "sourceOfSupply" property', () => {
    describe('and it has a source of supply', () => {
      it('will return the source of supply for use in the licence summary page', async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPoints).to.equal(null)
        expect(result.abstractionPointsCaption).to.equal(null)
        expect(result.abstractionPointLinkText).to.equal(null)
        expect(result.abstractionQuantities).to.equal(null)
        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it does not have a permitLicence object', () => {
      beforeEach(() => {
        licence.permitLicence = undefined
      })

      it('will return null for the source of supply and abstraction point information', async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPoints).to.equal(null)
        expect(result.abstractionPointsCaption).to.equal(null)
        expect(result.abstractionPointLinkText).to.equal(null)
        expect(result.abstractionQuantities).to.equal(null)
        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it does not have a purposes array', () => {
      beforeEach(() => {
        licence.permitLicence.purposes = undefined
      })

      it('will return null for the source of supply and abstraction point information', async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPoints).to.equal(null)
        expect(result.abstractionPointsCaption).to.equal(null)
        expect(result.abstractionPointLinkText).to.equal(null)
        expect(result.abstractionQuantities).to.equal(null)
        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('and it has an abstraction point with 4 national grid references but NGR4_NORTH is null', () => {
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
          NGR4_NORTH: 'null'
        }
      })

      it('will return the correct information for the abstraction point', async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPoints).to.equal([
          'Between National Grid References TL 23198 88603 and TM 23197 88602'
        ])
        expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
        expect(result.abstractionPointLinkText).to.equal('View details of the abstraction point')
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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPoints).to.equal([
          'Between National Grid References TL 23198 88603 and TM 23197 88602'
        ])
        expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
        expect(result.abstractionPointLinkText).to.equal('View details of the abstraction point')
      })
    })

    describe('and it has an NGR2_SHEET abstraction point but NGR2_NORTH is null', () => {
      beforeEach(() => {
        licence.permitLicence.purposes[0].purposePoints[0].point_detail = {
          NGR1_SHEET: 'TL',
          NGR2_SHEET: 'TM',
          NGR1_EAST: '23198',
          NGR2_EAST: '23197',
          NGR1_NORTH: '88603',
          NGR2_NORTH: 'null'
        }
      })

      it('will return the information for the abstraction point', async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionPoints).to.equal(['At National Grid Reference TL 23198 88603'])
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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

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
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionQuantities).to.equal([
          '6.00 litres per second'
        ])
      })
    })

    describe('and it has two purposes with the same abstraction information', () => {
      beforeEach(() => {
        licence.permitLicence.purposes = [{
          ANNUAL_QTY: 265,
          DAILY_QTY: 24,
          HOURLY_QTY: 60,
          INST_QTY: 6,
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
        }, {
          ANNUAL_QTY: 265,
          DAILY_QTY: 24,
          HOURLY_QTY: 60,
          INST_QTY: 6,
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
      })

      it('will display the formatted string with the rate per period and the correct caption', async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionQuantities).to.equal([
          '265.00 cubic metres per year',
          '24.00 cubic metres per day',
          '60.00 cubic metres per hour',
          '6.00 litres per second'
        ])
      })
    })

    describe('and it has two purposes with different abstraction information', () => {
      beforeEach(() => {
        licence.permitLicence.purposes = [{
          ANNUAL_QTY: 265,
          DAILY_QTY: 24,
          HOURLY_QTY: 60,
          INST_QTY: 6,
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
        }, {
          ANNUAL_QTY: 266,
          DAILY_QTY: 24,
          HOURLY_QTY: 60,
          INST_QTY: 6,
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
      })

      it('will display the formatted string with the rate per period and the correct caption', async () => {
        const result = await ViewLicenceSummaryPresenter.go(licence, licenceAbstractionConditions)

        expect(result.abstractionQuantities).to.equal(null)
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
  return LicenceModel.fromJson({
    id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
    expiredDate: null,
    startDate: new Date('2019-04-01'),
    region: {
      id: '740375f0-5add-4335-8ed5-b21b55b4a228',
      displayName: 'Avalon'
    },
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
    licenceVersions: [{
      id: 'ac9a8a56-c9ae-43d0-a003-296b4aa7481d',
      startDate: new Date('2022-04-01'),
      status: 'current',
      licenceVersionPurposes: [
        {
          id: '7f5e0838-d87a-4c2e-8e9b-09d6814b9ec4',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 10,
          purpose: { id: '0316229a-e76d-4785-bc2c-65075a1a8f50', description: 'Spray Irrigation - Storage' }
        },
        {
          id: 'da6cbb9b-edcb-4b5b-8d3a-fab22ce6ee8b',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 11,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 3,
          purpose: { id: '0316229a-e76d-4785-bc2c-65075a1a8f50', description: 'Spray Irrigation - Storage' }
        },
        {
          id: 'f68ed9a0-4a2b-42da-8f5b-c5c897113121',
          abstractionPeriodStartDay: 1,
          abstractionPeriodStartMonth: 4,
          abstractionPeriodEndDay: 31,
          abstractionPeriodEndMonth: 10,
          purpose: { id: 'd1fc1c6f-bff0-4da2-a41a-033f151fddc7', description: 'Spray Irrigation - Direct' }
        }
      ]
    }],
    licenceGaugingStations: [{
      id: 'f775f2cf-9b7c-4f1e-bb6f-6e81b34b1a8d',
      gaugingStation: {
        id: 'ac075651-4781-4e24-a684-b943b98607ca',
        label: 'MEVAGISSEY FIRE STATION'
      }
    }],
    licenceDocument: null,
    licenceDocumentHeader: { id: '28665d16-eba3-4c9a-aa55-7ab671b0c4fb' }
  })
}
