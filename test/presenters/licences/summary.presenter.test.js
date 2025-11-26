'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const PointModel = require('../../../app/models/point.model.js')
const { today, generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const SummaryPresenter = require('../../../app/presenters/licences/summary.presenter.js')

describe('Licences - Summary Presenter', () => {
  let summary

  beforeEach(() => {
    summary = _summary()
    Sinon.stub(FeatureFlagsConfig, 'enableMonitoringStationsView').value(true)
  })

  it('correctly presents the data', () => {
    const result = SummaryPresenter.go(summary)

    expect(result).to.equal({
      abstractionAmounts: [],
      abstractionConditions: ['Derogation clause', 'General conditions', 'Non standard quantities'],
      abstractionPeriods: ['1 April to 31 October', '1 November to 31 March'],
      abstractionPeriodsCaption: 'Periods of abstraction',
      abstractionPoints: ['At National Grid Reference TL 23198 88603'],
      abstractionPointsCaption: 'Point of abstraction',
      activeSecondaryNav: 'summary',
      enableMonitoringStationsView: true,
      endDate: null,
      licenceHolder: 'Unregistered licence',
      licenceId: summary.id,
      monitoringStations: [
        {
          id: summary.licenceMonitoringStations[0].monitoringStation.id,
          label: 'MEVAGISSEY FIRE STATION'
        }
      ],
      purposes: {
        caption: 'Purposes',
        data: ['Spray Irrigation - Storage', 'Spray Irrigation - Direct']
      },
      purposesCount: 3,
      region: 'Avalon',
      sourceOfSupply: 'SURFACE WATER SOURCE OF SUPPLY',
      startDate: '1 April 2022'
    })
  })

  describe('the "abstractionAmounts" property', () => {
    describe('when there are no licence version purposes', () => {
      beforeEach(() => {
        summary.licenceVersions[0].licenceVersionPurposes = []
      })

      it('returns an empty array', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.abstractionAmounts).to.be.empty()
      })
    })

    describe('when the there is one licence version purpose', () => {
      beforeEach(() => {
        summary.licenceVersions[0].licenceVersionPurposes = [
          {
            id: generateUUID(),
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10,
            annualQuantity: 180000,
            dailyQuantity: 720,
            hourlyQuantity: 144,
            instantQuantity: 40,
            purpose: { id: generateUUID(), description: 'Spray Irrigation - Storage' },
            points: [
              PointModel.fromJson({
                id: generateUUID(),
                description: null,
                ngr1: 'TL 23198 88603',
                ngr2: null,
                ngr3: null,
                ngr4: null,
                source: { id: generateUUID(), description: 'SURFACE WATER SOURCE OF SUPPLY' }
              })
            ],
            licenceVersionPurposeConditions: [
              {
                id: generateUUID(),
                licenceVersionPurposeConditionType: {
                  id: generateUUID(),
                  displayTitle: 'General conditions'
                }
              }
            ]
          }
        ]
      })

      it('returns abstractions amounts formatted for display', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.abstractionAmounts).to.equal([
          '180,000.00 cubic metres per year',
          '720.00 cubic metres per day',
          '144.00 cubic metres per hour',
          '40.00 litres per second'
        ])
      })
    })

    describe('when there are multiple licence version purposes', () => {
      it('returns an empty array', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.abstractionAmounts).to.be.empty()
      })
    })
  })

  describe('the "abstractionConditions" property', () => {
    describe('when there are multiple licence version purposes', () => {
      beforeEach(() => {
        const point = PointModel.fromJson({
          id: generateUUID(),
          description: null,
          ngr1: 'TL 23198 88603',
          ngr2: null,
          ngr3: null,
          ngr4: null,
          source: { id: generateUUID(), description: 'SURFACE WATER SOURCE OF SUPPLY' }
        })

        summary.licenceVersions[0].licenceVersionPurposes = [
          {
            id: generateUUID(),
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10,
            points: [point],
            purpose: { id: generateUUID(), description: 'Spray Irrigation - Storage' },
            licenceVersionPurposeConditions: []
          },
          {
            id: generateUUID(),
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 11,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            points: [point],
            purpose: { id: generateUUID(), description: 'Spray Irrigation - Storage' },
            licenceVersionPurposeConditions: []
          }
        ]
      })

      describe('and each contains a condition with a different display title', () => {
        beforeEach(() => {
          summary.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions.push({
            id: generateUUID(),
            licenceVersionPurposeConditionType: {
              id: generateUUID(),
              displayTitle: 'General conditions'
            }
          })

          summary.licenceVersions[0].licenceVersionPurposes[1].licenceVersionPurposeConditions.push({
            id: generateUUID(),
            licenceVersionPurposeConditionType: {
              id: generateUUID(),
              displayTitle: 'Derogation clause'
            }
          })
        })

        it('returns an array containing all the titles in alphabetical order', () => {
          const result = SummaryPresenter.go(summary)

          expect(result.abstractionConditions).to.equal(['Derogation clause', 'General conditions'])
        })
      })

      describe('and each contains conditions with the same display titles', () => {
        beforeEach(() => {
          summary.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions.push({
            id: generateUUID(),
            licenceVersionPurposeConditionType: {
              id: generateUUID(),
              displayTitle: 'General conditions'
            }
          })

          summary.licenceVersions[0].licenceVersionPurposes[1].licenceVersionPurposeConditions.push({
            id: generateUUID(),
            licenceVersionPurposeConditionType: {
              id: generateUUID(),
              displayTitle: 'General conditions'
            }
          })
        })

        it('returns an array containing only the distinct title', () => {
          const result = SummaryPresenter.go(summary)

          expect(result.abstractionConditions).to.equal(['General conditions'])
        })
      })
    })

    describe('when there is a single licence version purpose', () => {
      beforeEach(() => {
        summary.licenceVersions[0].licenceVersionPurposes = [
          {
            id: generateUUID(),
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10,
            points: [
              PointModel.fromJson({
                id: generateUUID(),
                description: null,
                ngr1: 'TL 23198 88603',
                ngr2: null,
                ngr3: null,
                ngr4: null,
                source: { id: generateUUID(), description: 'SURFACE WATER SOURCE OF SUPPLY' }
              })
            ],
            purpose: { id: generateUUID(), description: 'Spray Irrigation - Storage' },
            licenceVersionPurposeConditions: []
          }
        ]
      })

      describe('with conditions with different display titles', () => {
        beforeEach(() => {
          summary.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions.push(
            {
              id: generateUUID(),
              licenceVersionPurposeConditionType: {
                id: generateUUID(),
                displayTitle: 'General conditions'
              }
            },
            {
              id: generateUUID(),
              licenceVersionPurposeConditionType: {
                id: generateUUID(),
                displayTitle: 'Derogation clause'
              }
            }
          )
        })

        it('returns an array containing all the titles in alphabetical order', () => {
          const result = SummaryPresenter.go(summary)

          expect(result.abstractionConditions).to.equal(['Derogation clause', 'General conditions'])
        })
      })

      describe('with conditions with the same display titles', () => {
        beforeEach(() => {
          summary.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions.push(
            {
              id: generateUUID(),
              licenceVersionPurposeConditionType: {
                id: generateUUID(),
                displayTitle: 'General conditions'
              }
            },
            {
              id: generateUUID(),
              licenceVersionPurposeConditionType: {
                id: generateUUID(),
                displayTitle: 'General conditions'
              }
            }
          )
        })

        it('returns an array containing only the distinct title', () => {
          const result = SummaryPresenter.go(summary)

          expect(result.abstractionConditions).to.equal(['General conditions'])
        })
      })
    })
  })

  describe('the "abstractionPeriods" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        summary.licenceVersions = []
      })

      it('returns an empty array', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.abstractionPeriods).to.be.empty()
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          summary.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns an empty array', () => {
          const result = SummaryPresenter.go(summary)

          expect(result.abstractionPeriods).to.be.empty()
        })
      })

      describe('and a single licence version purpose linked to it', () => {
        beforeEach(() => {
          summary.licenceVersions[0].licenceVersionPurposes.pop()
          summary.licenceVersions[0].licenceVersionPurposes.pop()
        })

        it('returns the abstraction period formatted for display', () => {
          const result = SummaryPresenter.go(summary)

          expect(result.abstractionPeriods).to.equal(['1 April to 31 October'])
        })
      })

      describe('and multiple licence version purposes linked to it', () => {
        describe('that all have different abstraction periods', () => {
          beforeEach(() => {
            summary.licenceVersions[0].licenceVersionPurposes.pop()
          })

          it('returns the abstraction periods formatted for display', () => {
            const result = SummaryPresenter.go(summary)

            expect(result.abstractionPeriods).to.equal(['1 April to 31 October', '1 November to 31 March'])
          })
        })

        describe('that have the same abstraction periods', () => {
          beforeEach(() => {
            summary.licenceVersions[0].licenceVersionPurposes.splice(1, 1)
          })

          it('returns the abstraction period formatted for display', () => {
            const result = SummaryPresenter.go(summary)

            expect(result.abstractionPeriods).to.equal(['1 April to 31 October'])
          })
        })
      })
    })
  })

  describe('the "abstractionPeriodsCaption" property', () => {
    describe('when no abstraction periods have been extracted from the licence data', () => {
      beforeEach(() => {
        summary.licenceVersions = []
      })

      it('returns the singular caption', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.abstractionPeriodsCaption).to.equal('Period of abstraction')
      })
    })

    describe('when one unique abstraction period has been extracted from the licence data', () => {
      beforeEach(() => {
        summary.licenceVersions[0].licenceVersionPurposes.splice(1, 1)
      })

      it('returns the singular caption', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.abstractionPeriodsCaption).to.equal('Period of abstraction')
      })
    })

    describe('when multiple abstraction periods have been extracted from the licence data', () => {
      it('returns the plural caption', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.abstractionPeriodsCaption).to.equal('Periods of abstraction')
      })
    })
  })

  describe('the "abstractionPoints" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        summary.licenceVersions = []
      })

      it('returns an empty array', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.abstractionPoints).to.be.empty()
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          summary.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns an empty array', () => {
          const result = SummaryPresenter.go(summary)

          expect(result.abstractionPoints).to.be.empty()
        })
      })

      describe('and a single licence version purpose linked to it', () => {
        beforeEach(() => {
          summary.licenceVersions[0].licenceVersionPurposes.pop()
          summary.licenceVersions[0].licenceVersionPurposes.pop()
        })

        describe('that has a single point', () => {
          it('returns the abstraction point formatted for display', () => {
            const result = SummaryPresenter.go(summary)

            expect(result.abstractionPoints).to.equal(['At National Grid Reference TL 23198 88603'])
          })
        })

        describe('that has multiple points', () => {
          beforeEach(() => {
            summary.licenceVersions[0].licenceVersionPurposes[0].points.push(
              PointModel.fromJson({
                description: 'RIVER MEDWAY AT YALDING INTAKE',
                id: generateUUID(),
                ngr1: 'TQ 69212 50394',
                ngr2: null,
                ngr3: null,
                ngr4: null,
                source: { id: generateUUID(), description: 'SURFACE WATER SOURCE OF SUPPLY' }
              })
            )
          })

          it('returns the abstraction points formatted for display', () => {
            const result = SummaryPresenter.go(summary)

            expect(result.abstractionPoints).to.equal([
              'At National Grid Reference TL 23198 88603',
              'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
            ])
          })
        })
      })

      describe('and multiple licence version purposes linked to it', () => {
        describe('that have the same point', () => {
          it('returns the abstraction point formatted for display', () => {
            const result = SummaryPresenter.go(summary)

            expect(result.abstractionPoints).to.equal(['At National Grid Reference TL 23198 88603'])
          })
        })

        describe('some of which have different points', () => {
          beforeEach(() => {
            summary.licenceVersions[0].licenceVersionPurposes[1].points[0] = PointModel.fromJson({
              description: 'RIVER MEDWAY AT YALDING INTAKE',
              id: generateUUID(),
              ngr1: 'TQ 69212 50394',
              ngr2: null,
              ngr3: null,
              ngr4: null,
              source: { id: generateUUID(), description: 'SURFACE WATER SOURCE OF SUPPLY' }
            })
          })

          it('returns the abstraction points formatted for display', () => {
            const result = SummaryPresenter.go(summary)

            expect(result.abstractionPoints).to.equal([
              'At National Grid Reference TL 23198 88603',
              'At National Grid Reference TQ 69212 50394 (RIVER MEDWAY AT YALDING INTAKE)'
            ])
          })
        })
      })
    })
  })

  describe('the "abstractionPointsCaption" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        summary.licenceVersions = []
      })

      it('returns the singular caption', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          summary.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns the singular caption', () => {
          const result = SummaryPresenter.go(summary)

          expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
        })
      })

      describe('and at least one licence version purpose linked to it', () => {
        describe('but the points are all the same', () => {
          it('returns the singular caption', () => {
            const result = SummaryPresenter.go(summary)

            expect(result.abstractionPointsCaption).to.equal('Point of abstraction')
          })
        })

        describe('and the points are not all the same', () => {
          beforeEach(() => {
            summary.licenceVersions[0].licenceVersionPurposes[1].points[0] = PointModel.fromJson({
              description: 'RIVER MEDWAY AT YALDING INTAKE',
              id: generateUUID(),
              ngr1: 'TQ 69212 50394',
              ngr2: null,
              ngr3: null,
              ngr4: null,
              source: { id: generateUUID(), description: 'SURFACE WATER SOURCE OF SUPPLY' }
            })
          })

          it('returns the plural caption', () => {
            const result = SummaryPresenter.go(summary)

            expect(result.abstractionPointsCaption).to.equal('Points of abstraction')
          })
        })
      })
    })
  })

  describe('the "endDate" property', () => {
    describe('when the licence expired date is null', () => {
      it('returns null', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.endDate).to.be.null()
      })
    })

    describe('when the licence expired date is set to a date less than or equal to today', () => {
      beforeEach(() => {
        // NOTE: The date we get back from the DB is without time. If we just assigned new Date() to expiredDate
        // there is a chance the test could fail depending on how quickly this is compared to the logic in the
        // presenter
        summary.expiredDate = today()
      })

      it('returns null', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.endDate).to.be.null()
      })
    })

    describe('when the licence expired date is set to a date greater than today (2099-04-01)', () => {
      beforeEach(() => {
        summary.expiredDate = new Date('2099-04-01')
      })

      it('returns "1 April 2099"', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.endDate).to.equal('1 April 2099')
      })
    })
  })

  describe('the "licenceHolder" property', () => {
    describe('when the licence holder is not set', () => {
      it('returns "Unregistered licence"', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.licenceHolder).to.equal('Unregistered licence')
      })
    })

    describe('when the licence holder is set', () => {
      beforeEach(() => {
        // We 'mimic' licenceDocument containing a ContactModel instance that is populated. If it was the call to its
        // instance method $name() would return the contact's name. We pretend in order to test the logic in the
        // presenter
        const contact = {
          $name: () => {
            return 'Barbara Liskov'
          }
        }

        summary.licenceDocument = {
          licenceDocumentRoles: [{ contact }]
        }
      })

      it('returns "Barbara Liskov"', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.licenceHolder).to.equal('Barbara Liskov')
      })
    })
  })

  describe('the "monitoringStations" property', () => {
    describe('when the licence is linked to no monitoring stations', () => {
      beforeEach(() => {
        summary.licenceMonitoringStations = []
      })

      it('will return an empty array', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.monitoringStations).to.equal([])
      })
    })

    describe('when the licence is linked to a single monitoring station', () => {
      it("will return an array with the monitoring station's details", () => {
        const result = SummaryPresenter.go(summary)

        expect(result.monitoringStations).to.equal([
          {
            id: summary.licenceMonitoringStations[0].monitoringStation.id,
            label: 'MEVAGISSEY FIRE STATION'
          }
        ])
      })
    })

    describe('when the licence is linked to multiple monitoring stations', () => {
      describe('that are all different', () => {
        beforeEach(() => {
          summary.licenceMonitoringStations.push({
            id: generateUUID(),
            monitoringStation: {
              id: generateUUID(),
              label: 'AVALON FIRE STATION'
            }
          })
        })

        it('will return an array with each monitoring stations details', () => {
          const result = SummaryPresenter.go(summary)

          expect(result.monitoringStations).to.equal([
            { id: summary.licenceMonitoringStations[0].monitoringStation.id, label: 'MEVAGISSEY FIRE STATION' },
            { id: summary.licenceMonitoringStations[1].monitoringStation.id, label: 'AVALON FIRE STATION' }
          ])
        })
      })

      describe('that are all the same station', () => {
        beforeEach(() => {
          summary.licenceMonitoringStations.push({
            id: summary.licenceMonitoringStations[0].id,
            monitoringStation: {
              id: summary.licenceMonitoringStations[0].monitoringStation.id,
              label: 'MEVAGISSEY FIRE STATION'
            }
          })
        })

        it("will return an array with just the one monitoring station's details", () => {
          const result = SummaryPresenter.go(summary)

          expect(result.monitoringStations).to.equal([
            {
              id: summary.licenceMonitoringStations[0].monitoringStation.id,
              label: 'MEVAGISSEY FIRE STATION'
            }
          ])
        })
      })
    })
  })

  describe('the "purposes" property', () => {
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        summary.licenceVersions = []
      })

      it('returns null', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.purposes).to.equal(null)
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          summary.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns null', () => {
          const result = SummaryPresenter.go(summary)

          expect(result.purposes).to.equal(null)
        })
      })

      describe('and a single licence version purpose linked to it', () => {
        beforeEach(() => {
          summary.licenceVersions[0].licenceVersionPurposes.pop()
          summary.licenceVersions[0].licenceVersionPurposes.pop()
        })

        it('returns the singular version of the caption and the purpose descriptions', () => {
          const result = SummaryPresenter.go(summary)

          expect(result.purposes).to.equal({
            caption: 'Purpose',
            data: ['Spray Irrigation - Storage']
          })
        })
      })

      describe('and multiple licence version purposes linked to it', () => {
        describe('that all have different purposes', () => {
          beforeEach(() => {
            summary.licenceVersions[0].licenceVersionPurposes.splice(1, 1)
          })

          it('returns the plural version of the caption and all purpose descriptions', () => {
            const result = SummaryPresenter.go(summary)

            expect(result.purposes).to.equal({
              caption: 'Purposes',
              data: ['Spray Irrigation - Storage', 'Spray Irrigation - Direct']
            })
          })
        })

        describe('that have some abstraction purposes that are the same', () => {
          it('returns the plural version of the captions and the unique purpose descriptions', () => {
            const result = SummaryPresenter.go(summary)

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
    describe('when there is no "current" licence version', () => {
      beforeEach(() => {
        summary.licenceVersions = []
      })

      it('returns null', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.sourceOfSupply).to.equal(null)
      })
    })

    describe('when there is a "current" licence version', () => {
      describe('but no licence version purposes linked to it', () => {
        beforeEach(() => {
          summary.licenceVersions[0].licenceVersionPurposes = []
        })

        it('returns null', () => {
          const result = SummaryPresenter.go(summary)

          expect(result.sourceOfSupply).to.equal(null)
        })
      })

      describe('and at least one licence version purpose linked to it', () => {
        describe('but it has no points', () => {
          beforeEach(() => {
            summary.licenceVersions[0].licenceVersionPurposes[0].points = []
          })

          it('returns null', () => {
            const result = SummaryPresenter.go(summary)

            expect(result.sourceOfSupply).to.equal(null)
          })
        })

        describe('and it has at least one point', () => {
          it('returns the source description of the first point', () => {
            const result = SummaryPresenter.go(summary)

            expect(result.sourceOfSupply).to.equal('SURFACE WATER SOURCE OF SUPPLY')
          })
        })
      })
    })
  })

  describe('the "startDate" property', () => {
    describe('when the current version is null', () => {
      beforeEach(() => {
        summary.$currentVersion = () => {
          return null
        }
      })

      it('returns the current version start date', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.startDate).to.equal('1 April 2019')
      })
    })

    describe('when the current version is not null', () => {
      beforeEach(() => {
        summary.$currentVersion = () => {
          return { startDate: '2021-01-01', licenceVersionPurposes: [] }
        }
      })

      it('returns the current version start date', () => {
        const result = SummaryPresenter.go(summary)

        expect(result.startDate).to.equal('1 January 2021')
      })
    })
  })
})

function _summary() {
  const point = PointModel.fromJson({
    id: generateUUID(),
    description: null,
    ngr1: 'TL 23198 88603',
    ngr2: null,
    ngr3: null,
    ngr4: null,
    source: { id: generateUUID(), description: 'SURFACE WATER SOURCE OF SUPPLY' }
  })

  return LicenceModel.fromJson({
    id: generateUUID(),
    expiredDate: null,
    startDate: new Date('2019-04-01'),
    region: {
      id: generateUUID(),
      displayName: 'Avalon'
    },
    licenceVersions: [
      {
        id: generateUUID(),
        startDate: new Date('2022-04-01'),
        status: 'current',
        licenceVersionPurposes: [
          {
            id: generateUUID(),
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10,
            annualQuantity: 180000,
            dailyQuantity: 720,
            hourlyQuantity: 144,
            instantQuantity: 40,
            purpose: { id: generateUUID(), description: 'Spray Irrigation - Storage' },
            points: [point],
            licenceVersionPurposeConditions: [
              {
                id: generateUUID(),
                licenceVersionPurposeConditionType: {
                  id: generateUUID(),
                  displayTitle: 'General conditions'
                }
              },
              {
                id: generateUUID(),
                licenceVersionPurposeConditionType: {
                  id: generateUUID(),
                  displayTitle: 'Derogation clause'
                }
              }
            ]
          },
          {
            id: generateUUID(),
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 11,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            annualQuantity: null,
            dailyQuantity: null,
            hourlyQuantity: null,
            instantQuantity: null,
            purpose: { id: generateUUID(), description: 'Spray Irrigation - Storage' },
            points: [point],
            licenceVersionPurposeConditions: [
              {
                id: generateUUID(),
                licenceVersionPurposeConditionType: {
                  id: generateUUID(),
                  displayTitle: 'General conditions'
                }
              }
            ]
          },
          {
            id: generateUUID(),
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 10,
            annualQuantity: null,
            dailyQuantity: null,
            hourlyQuantity: null,
            instantQuantity: null,
            purpose: { id: generateUUID(), description: 'Spray Irrigation - Direct' },
            points: [point],
            licenceVersionPurposeConditions: [
              {
                id: generateUUID(),
                licenceVersionPurposeConditionType: {
                  id: generateUUID(),
                  displayTitle: 'Non standard quantities'
                }
              }
            ]
          }
        ]
      }
    ],
    licenceMonitoringStations: [
      {
        id: generateUUID(),
        monitoringStation: {
          id: generateUUID(),
          label: 'MEVAGISSEY FIRE STATION'
        }
      }
    ],
    licenceDocument: null,
    licenceDocumentHeader: { id: generateUUID() }
  })
}
