'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CheckPresenter = require('../../../../app/presenters/return-logs/setup/check.presenter.js')

describe('Return Logs Setup - Check presenter', () => {
  let session

  beforeEach(() => {
    session = _sessionData()
  })

  describe('when provided with a populated session', () => {
    it('correctly presents the data', () => {
      const result = CheckPresenter.go(session)

      expect(result).to.equal({
        abstractionPeriod: '1 January to 31 December',
        displayReadings: false,
        displayUnits: true,
        enterMultipleLinkText: 'Enter multiple monthly volumes',
        links: {
          cancel: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/cancel',
          meterDetails: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/meter-provided',
          multipleEntries: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/multiple-entries',
          nilReturn: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/submission',
          received: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/received',
          reported: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/reported',
          startReading: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/start-reading',
          units: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/units'
        },
        meter10TimesDisplay: 'yes',
        meterMake: 'Test meter make',
        meterProvided: 'yes',
        meterSerialNumber: '098765',
        nilReturn: 'No',
        note: {
          actions: [
            {
              href: 'note',
              text: 'Add a note'
            }
          ],
          text: 'No notes added'
        },
        pageTitle: 'Check details and enter new volumes or readings',
        pageTitleCaption: 'Return reference 1234',
        purposes: 'Evaporative Cooling',
        returnReceivedDate: '31 January 2025',
        reportingFigures: 'Volumes',
        returnPeriod: '1 April 2023 to 31 March 2024',
        siteDescription: 'POINT A, TEST SITE DESCRIPTION',
        startReading: undefined,
        summaryTableData: {
          headers: [
            {
              text: 'Month'
            },
            {
              format: 'numeric',
              text: 'Megalitres'
            },
            {
              format: 'numeric',
              text: 'Cubic metres'
            },
            {
              format: 'numeric',
              text: 'Details'
            }
          ],
          rows: [
            {
              link: {
                href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/volumes/2023-3',
                text: 'Enter monthly volumes'
              },
              month: 'April 2023',
              monthlyTotal: null,
              unitTotal: null
            },
            {
              link: {
                href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/volumes/2023-4',
                text: 'Enter monthly volumes'
              },
              month: 'May 2023',
              monthlyTotal: null,
              unitTotal: null
            },
            {
              link: {
                href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/volumes/2023-5',
                text: 'Enter monthly volumes'
              },
              month: 'June 2023',
              monthlyTotal: null,
              unitTotal: null
            }
          ]
        },
        tableTitle: 'Summary of monthly volumes',
        tariff: 'Standard',
        totalCubicMetres: '0',
        totalQuantity: '0',
        units: 'Megalitres'
      })
    })

    describe('and the "Enter a nil return" route has been selected', () => {
      beforeEach(() => {
        session.journey = 'nilReturn'
      })

      it('correctly presents the data', () => {
        const result = CheckPresenter.go(session)

        expect(result).to.equal({
          abstractionPeriod: '1 January to 31 December',
          links: {
            cancel: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/cancel',
            meterDetails: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/meter-provided',
            multipleEntries: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/multiple-entries',
            nilReturn: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/submission',
            received: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/received',
            reported: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/reported',
            startReading: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/start-reading',
            units: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/units'
          },
          nilReturn: 'Yes',
          note: {
            actions: [
              {
                href: 'note',
                text: 'Add a note'
              }
            ],
            text: 'No notes added'
          },
          pageTitle: 'Check details and enter new volumes or readings',
          pageTitleCaption: 'Return reference 1234',
          purposes: 'Evaporative Cooling',
          returnPeriod: '1 April 2023 to 31 March 2024',
          returnReceivedDate: '31 January 2025',
          siteDescription: 'POINT A, TEST SITE DESCRIPTION',
          tariff: 'Standard'
        })
      })
    })
  })

  describe('the "displayReadings" property', () => {
    describe('when the user has used meter readings', () => {
      beforeEach(() => {
        session.reported = 'meterReadings'
      })

      it('returns "true"', () => {
        const result = CheckPresenter.go(session)

        expect(result.displayReadings).to.be.true()
      })
    })

    describe('when the user has used volumes', () => {
      beforeEach(() => {
        session.reported = 'abstractionVolumes'
      })

      it('returns "false"', () => {
        const result = CheckPresenter.go(session)

        expect(result.displayReadings).to.be.false()
      })
    })
  })

  describe('the "displayUnits" property', () => {
    describe('when the unit of measurement used is "cubic-metres"', () => {
      beforeEach(() => {
        session.units = 'cubic-metres'
      })

      it('returns "false"', () => {
        const result = CheckPresenter.go(session)

        expect(result.displayUnits).to.be.false()
      })
    })

    describe('when the unit of measurement used is not "cubic-metres"', () => {
      beforeEach(() => {
        session.units = 'megalitres'
      })

      it('returns "true"', () => {
        const result = CheckPresenter.go(session)

        expect(result.displayUnits).to.be.true()
      })
    })
  })

  describe('the "enterMultipleLinkText" property', () => {
    beforeEach(() => {
      session.returnsFrequency = 'month'
    })

    it('returns the frequency in the link text', () => {
      const result = CheckPresenter.go(session)

      expect(result.enterMultipleLinkText).to.contain('monthly')
    })

    describe('when the values are reported using "abstractionVolumes"', () => {
      beforeEach(() => {
        session.reported = 'abstractionVolumes'
      })

      it('returns "volumes" in the link text', () => {
        const result = CheckPresenter.go(session)

        expect(result.enterMultipleLinkText).to.equal('Enter multiple monthly volumes')
      })
    })

    describe('when the reporting method is not "abstractionVolumes"', () => {
      beforeEach(() => {
        session.reported = 'meterReadings'
      })

      it('returns "readings" in the link text', () => {
        const result = CheckPresenter.go(session)

        expect(result.enterMultipleLinkText).to.equal('Enter multiple monthly readings')
      })
    })
  })

  describe('the "note" property', () => {
    describe('when the user has added a note', () => {
      beforeEach(() => {
        session.note = {
          content: 'Note attached to requirement'
        }
      })

      it('returns text with the note content and the change and delete a note action', () => {
        const result = CheckPresenter.go(session)

        expect(result.note).to.equal({
          actions: [
            {
              href: 'note',
              text: 'Change'
            },
            {
              href: 'delete-note',
              text: 'Delete'
            }
          ],
          text: 'Note attached to requirement'
        })
      })
    })

    describe('when the user has not added a note', () => {
      it('returns text with "No notes added" and the add a note action', () => {
        const result = CheckPresenter.go(session)

        expect(result.note).to.equal({
          actions: [
            {
              href: 'note',
              text: 'Add a note'
            }
          ],
          text: 'No notes added'
        })
      })
    })
  })

  describe('the "purposes" property', () => {
    describe('when there is a single purpose', () => {
      beforeEach(() => {
        session.purposes = ['Evaporative Cooling']
      })

      it('returns the description of the purpose', () => {
        const result = CheckPresenter.go(session)

        expect(result.purposes).to.equal('Evaporative Cooling')
      })
    })

    describe('when there are multiple purposes', () => {
      beforeEach(() => {
        session.purposes = ['Evaporative Cooling', 'Trickle Irrigation - Storage']
      })

      it('returns the descriptions as a comma separated string', () => {
        const result = CheckPresenter.go(session)

        expect(result.purposes).to.equal('Evaporative Cooling, Trickle Irrigation - Storage')
      })
    })
  })

  describe('the "reportingFigures" property', () => {
    describe('when the user has used meter readings', () => {
      beforeEach(() => {
        session.reported = 'meterReadings'
      })

      it('returns the method of gathering the figures as "Meter readings"', () => {
        const result = CheckPresenter.go(session)

        expect(result.reportingFigures).to.equal('Meter readings')
      })
    })

    describe('when the user has used volumes', () => {
      beforeEach(() => {
        session.reported = 'abstractionVolumes'
      })

      it('returns the method of gathering the figures as "Volumes"', () => {
        const result = CheckPresenter.go(session)

        expect(result.reportingFigures).to.equal('Volumes')
      })
    })
  })

  describe('the "summaryTableData" property', () => {
    describe('when the reporting method is volumes', () => {
      beforeEach(() => {
        session.reported = 'abstractionVolumes'
      })

      describe('and the frequency is monthly', () => {
        beforeEach(() => {
          session.lines = [
            {
              endDate: '2023-04-30T00:00:00.000Z',
              startDate: '2023-04-01T00:00:00.000Z',
              quantity: 10.123567
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              startDate: '2023-05-01T00:00:00.000Z',
              quantity: null
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              startDate: '2023-06-01T00:00:00.000Z',
              quantity: 1000
            }
          ]
          session.returnsFrequency = 'month'
        })

        describe('and the unit of measurement is cubic metres', () => {
          beforeEach(() => {
            session.units = 'cubic-metres'
          })

          it('returns the "summaryTableData" headers', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.headers).to.equal([
              { text: 'Month' },
              { text: 'Cubic metres', format: 'numeric' },
              { text: 'Details', format: 'numeric' }
            ])
          })

          it('returns the "summaryTableData" rows', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.rows).to.equal([
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/volumes/2023-3',
                  text: 'Enter monthly volumes'
                },
                month: 'April 2023',
                monthlyTotal: '10.124',
                unitTotal: '10.124'
              },
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/volumes/2023-4',
                  text: 'Enter monthly volumes'
                },
                month: 'May 2023',
                monthlyTotal: null,
                unitTotal: null
              },
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/volumes/2023-5',
                  text: 'Enter monthly volumes'
                },
                month: 'June 2023',
                monthlyTotal: '1,000',
                unitTotal: '1,000'
              }
            ])
          })
        })

        describe('and the unit of measurement is not cubic metres', () => {
          beforeEach(() => {
            session.units = 'megalitres'
          })

          it('returns the "summaryTableData" headers with an additional column for the UOM used', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.headers).to.equal([
              { text: 'Month' },
              { text: 'Megalitres', format: 'numeric' },
              { text: 'Cubic metres', format: 'numeric' },
              { text: 'Details', format: 'numeric' }
            ])
          })

          it('returns the "summaryTableData" rows with the monthlyTotal converted to cubic metres', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.rows).to.equal([
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/volumes/2023-3',
                  text: 'Enter monthly volumes'
                },
                month: 'April 2023',
                monthlyTotal: '10,123.567',
                unitTotal: '10.124'
              },
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/volumes/2023-4',
                  text: 'Enter monthly volumes'
                },
                month: 'May 2023',
                monthlyTotal: null,
                unitTotal: null
              },
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/volumes/2023-5',
                  text: 'Enter monthly volumes'
                },
                month: 'June 2023',
                monthlyTotal: '1,000,000',
                unitTotal: '1,000'
              }
            ])
          })
        })
      })

      describe('and the frequency is daily', () => {
        beforeEach(() => {
          session.lines = [
            {
              endDate: '2023-04-01T00:00:00.000Z',
              startDate: '2023-04-01T00:00:00.000Z',
              quantity: 10.123567
            },
            {
              endDate: '2023-04-02T00:00:00.000Z',
              startDate: '2023-04-02T00:00:00.000Z',
              quantity: null
            },
            {
              endDate: '2023-04-03T00:00:00.000Z',
              startDate: '2023-04-03T00:00:00.000Z',
              quantity: 1000
            }
          ]
          session.returnsFrequency = 'day'
        })

        describe('and the unit of measurement is cubic metres', () => {
          beforeEach(() => {
            session.units = 'cubic-metres'
          })

          it('returns the "summaryTableData" headers', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.headers).to.equal([
              { text: 'Month' },
              { text: 'Total cubic metres', format: 'numeric' },
              { text: 'Details', format: 'numeric' }
            ])
          })

          it('returns the "summaryTableData" rows grouped in months', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.rows).to.equal([
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/volumes/2023-3',
                  text: 'Enter daily volumes'
                },
                month: 'April 2023',
                monthlyTotal: '1,010.124',
                unitTotal: '1,010.124'
              }
            ])
          })
        })

        describe('and the unit of measurement is not cubic metres', () => {
          beforeEach(() => {
            session.units = 'gallons'
          })

          it('returns the "summaryTableData" headers with an additional column for the UOM used', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.headers).to.equal([
              { text: 'Month' },
              { text: 'Total gallons', format: 'numeric' },
              { text: 'Total cubic metres', format: 'numeric' },
              { text: 'Details', format: 'numeric' }
            ])
          })

          it('returns the "summaryTableData" rows with the monthlyTotal converted to cubic metres', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.rows).to.equal([
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/volumes/2023-3',
                  text: 'Enter daily volumes'
                },
                month: 'April 2023',
                monthlyTotal: '4.592',
                unitTotal: '1,010.124'
              }
            ])
          })
        })
      })
    })

    describe('when the reporting method is meter readings', () => {
      beforeEach(() => {
        session.meter10TimesDisplay = 'no'
        session.reported = 'meterReadings'
        session.startReading = 100
      })

      describe('and the frequency is monthly', () => {
        beforeEach(() => {
          session.lines = [
            {
              endDate: '2023-04-30T00:00:00.000Z',
              startDate: '2023-04-01T00:00:00.000Z'
            },
            {
              endDate: '2023-05-31T00:00:00.000Z',
              startDate: '2023-05-01T00:00:00.000Z',
              reading: 102
            },
            {
              endDate: '2023-06-30T00:00:00.000Z',
              startDate: '2023-06-01T00:00:00.000Z',
              reading: 200
            }
          ]
          session.returnsFrequency = 'month'
        })

        describe('and the unit of measurement is cubic metres', () => {
          beforeEach(() => {
            session.units = 'cubic-metres'
          })

          it('returns the "summaryTableData" headers', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.headers).to.equal([
              { text: 'Month' },
              { text: 'Reading', format: 'numeric' },
              { text: 'Cubic metres', format: 'numeric' },
              { text: 'Details', format: 'numeric' }
            ])
          })

          it('returns the "summaryTableData" rows', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.rows).to.equal([
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/readings/2023-3',
                  text: 'Enter monthly readings'
                },
                month: 'April 2023',
                monthlyTotal: null,
                unitTotal: null,
                reading: null
              },
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/readings/2023-4',
                  text: 'Enter monthly readings'
                },
                month: 'May 2023',
                monthlyTotal: '2',
                unitTotal: '2',
                reading: 102
              },
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/readings/2023-5',
                  text: 'Enter monthly readings'
                },
                month: 'June 2023',
                monthlyTotal: '98',
                unitTotal: '98',
                reading: 200
              }
            ])
          })

          describe('and the meter has a x10 display', () => {
            beforeEach(() => {
              session.meter10TimesDisplay = 'yes'
            })

            it('returns the "summaryTableData" rows with the volumes x10', () => {
              const result = CheckPresenter.go(session)

              expect(result.summaryTableData.rows).to.equal([
                {
                  link: {
                    href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/readings/2023-3',
                    text: 'Enter monthly readings'
                  },
                  month: 'April 2023',
                  monthlyTotal: null,
                  unitTotal: null,
                  reading: null
                },
                {
                  link: {
                    href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/readings/2023-4',
                    text: 'Enter monthly readings'
                  },
                  month: 'May 2023',
                  monthlyTotal: '20',
                  unitTotal: '20',
                  reading: 102
                },
                {
                  link: {
                    href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/readings/2023-5',
                    text: 'Enter monthly readings'
                  },
                  month: 'June 2023',
                  monthlyTotal: '980',
                  unitTotal: '980',
                  reading: 200
                }
              ])
            })
          })
        })

        describe('and the unit of measurement is not cubic metres', () => {
          beforeEach(() => {
            session.units = 'megalitres'
          })

          it('returns the "summaryTableData" headers with an additional column for the UOM used', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.headers).to.equal([
              { text: 'Month' },
              { text: 'Reading', format: 'numeric' },
              { text: 'Megalitres', format: 'numeric' },
              { text: 'Cubic metres', format: 'numeric' },
              { text: 'Details', format: 'numeric' }
            ])
          })

          it('returns the "summaryTableData" rows with the monthlyTotal converted to cubic metres', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.rows).to.equal([
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/readings/2023-3',
                  text: 'Enter monthly readings'
                },
                month: 'April 2023',
                monthlyTotal: null,
                unitTotal: null,
                reading: null
              },
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/readings/2023-4',
                  text: 'Enter monthly readings'
                },
                month: 'May 2023',
                monthlyTotal: '2,000',
                unitTotal: '2',
                reading: 102
              },
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/readings/2023-5',
                  text: 'Enter monthly readings'
                },
                month: 'June 2023',
                monthlyTotal: '98,000',
                unitTotal: '98',
                reading: 200
              }
            ])
          })
        })
      })

      describe('and the frequency is daily', () => {
        beforeEach(() => {
          session.lines = [
            {
              endDate: '2023-04-01T00:00:00.000Z',
              startDate: '2023-04-01T00:00:00.000Z',
              reading: 102
            },
            {
              endDate: '2023-04-02T00:00:00.000Z',
              startDate: '2023-04-02T00:00:00.000Z'
            },
            {
              endDate: '2023-04-03T00:00:00.000Z',
              startDate: '2023-04-03T00:00:00.000Z',
              reading: 200
            }
          ]
          session.returnsFrequency = 'day'
        })

        describe('and the unit of measurement is cubic metres', () => {
          beforeEach(() => {
            session.units = 'cubic-metres'
          })

          it('returns the "summaryTableData" headers', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.headers).to.equal([
              { text: 'Month' },
              { text: 'End reading', format: 'numeric' },
              { text: 'Total cubic metres', format: 'numeric' },
              { text: 'Details', format: 'numeric' }
            ])
          })

          it('returns the "summaryTableData" rows grouped in months', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.rows).to.equal([
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/readings/2023-3',
                  text: 'Enter daily readings'
                },
                month: 'April 2023',
                monthlyTotal: '100',
                unitTotal: '100',
                reading: 200
              }
            ])
          })
        })

        describe('and the unit of measurement is not cubic metres', () => {
          beforeEach(() => {
            session.units = 'gallons'
          })

          it('returns the "summaryTableData" headers with an additional column for the UOM used', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.headers).to.equal([
              { text: 'Month' },
              { text: 'End reading', format: 'numeric' },
              { text: 'Total gallons', format: 'numeric' },
              { text: 'Total cubic metres', format: 'numeric' },
              { text: 'Details', format: 'numeric' }
            ])
          })

          it('returns the "summaryTableData" rows with the monthlyTotal converted to cubic metres', () => {
            const result = CheckPresenter.go(session)

            expect(result.summaryTableData.rows).to.equal([
              {
                link: {
                  href: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/readings/2023-3',
                  text: 'Enter daily readings'
                },
                month: 'April 2023',
                monthlyTotal: '0.455',
                unitTotal: '100',
                reading: 200
              }
            ])
          })
        })
      })
    })
  })

  describe('the "tableTitle" property', () => {
    beforeEach(() => {
      session.returnsFrequency = 'month'
    })

    it('returns the frequency in the title', () => {
      const result = CheckPresenter.go(session)

      expect(result.tableTitle).to.contain('monthly')
    })

    describe('when the values are reported using "abstractionVolumes"', () => {
      beforeEach(() => {
        session.reported = 'abstractionVolumes'
      })

      it('returns "abstraction volumes" in the title', () => {
        const result = CheckPresenter.go(session)

        expect(result.tableTitle).to.equal('Summary of monthly volumes')
      })
    })

    describe('when the reporting method is not "abstractionVolumes"', () => {
      beforeEach(() => {
        session.reported = 'meterReadings'
      })

      it('returns "meter readings" in the title', () => {
        const result = CheckPresenter.go(session)

        expect(result.tableTitle).to.equal('Summary of monthly readings')
      })
    })
  })

  describe('the "tariff" property', () => {
    describe('when the tariff is "Two-part"', () => {
      beforeEach(() => {
        session.twoPartTariff = true
      })

      it('returns the tariff as "Two-part"', () => {
        const result = CheckPresenter.go(session)

        expect(result.tariff).to.equal('Two-part')
      })
    })

    describe('when the tariff is "Standard"', () => {
      beforeEach(() => {
        session.twoPartTariff = false
      })

      it('returns the tariff as "Standard"', () => {
        const result = CheckPresenter.go(session)

        expect(result.tariff).to.equal('Standard')
      })
    })
  })

  describe('the "totalCubicMetres" property', () => {
    beforeEach(() => {
      session.lines = [
        {
          endDate: '2023-04-30T00:00:00.000Z',
          startDate: '2023-04-01T00:00:00.000Z',
          quantity: 1000.123456
        }
      ]
    })

    describe('when the unit of measurement is cubic metres', () => {
      beforeEach(() => {
        session.units = 'cubic-metres'
      })

      it('returns the "totalQuantity" to 3 decimal places formatted as a string', () => {
        const result = CheckPresenter.go(session)

        expect(result.totalCubicMetres).to.equal('1,000.123')
      })
    })

    describe('when the unit of measurement is not cubic metres', () => {
      beforeEach(() => {
        session.units = 'megalitres'
      })

      it('returns the "totalQuantity" converted to cubic metres to 3 decimal places formatted as a string', () => {
        const result = CheckPresenter.go(session)

        expect(result.totalCubicMetres).to.equal('1,000,123.456')
      })
    })
  })

  describe('the "totalQuantity" property', () => {
    describe('when the "quantity" of each line is populated', () => {
      beforeEach(() => {
        session.lines = [
          {
            endDate: '2023-04-30T00:00:00.000Z',
            startDate: '2023-04-01T00:00:00.000Z',
            quantity: 10.123567
          },
          {
            endDate: '2023-05-31T00:00:00.000Z',
            startDate: '2023-05-01T00:00:00.000Z',
            quantity: null
          },
          {
            endDate: '2023-06-30T00:00:00.000Z',
            startDate: '2023-06-01T00:00:00.000Z',
            quantity: 1000
          }
        ]
      })

      it('returns the "totalQuantity" to 3 decimal places formatted as a string', () => {
        const result = CheckPresenter.go(session)

        expect(result.totalQuantity).to.equal('1,010.124')
      })
    })

    describe('when the "quantity" of each line is null', () => {
      beforeEach(() => {
        session.lines = [
          {
            endDate: '2023-04-30T00:00:00.000Z',
            startDate: '2023-04-01T00:00:00.000Z',
            quantity: null
          },
          {
            endDate: '2023-05-31T00:00:00.000Z',
            startDate: '2023-05-01T00:00:00.000Z',
            quantity: null
          },
          {
            endDate: '2023-06-30T00:00:00.000Z',
            startDate: '2023-06-01T00:00:00.000Z',
            quantity: null
          }
        ]
      })

      it('returns the "totalQuantity" as 0 formatted as a string', () => {
        const result = CheckPresenter.go(session)

        expect(result.totalQuantity).to.equal('0')
      })
    })
  })

  describe('the "units" property', () => {
    describe('when the user has used cubic metres', () => {
      beforeEach(() => {
        session.units = 'cubic-metres'
      })

      it('returns the unit of measurement as "Cubic metres"', () => {
        const result = CheckPresenter.go(session)

        expect(result.units).to.equal('Cubic metres')
      })
    })

    describe('when the user has used litres', () => {
      beforeEach(() => {
        session.units = 'litres'
      })

      it('returns the unit of measurement as "Litres"', () => {
        const result = CheckPresenter.go(session)

        expect(result.units).to.equal('Litres')
      })
    })

    describe('when the user has used megalitres', () => {
      beforeEach(() => {
        session.units = 'megalitres'
      })

      it('returns the unit of measurement as "Megalitres"', () => {
        const result = CheckPresenter.go(session)

        expect(result.units).to.equal('Megalitres')
      })
    })

    describe('when the user has used gallons', () => {
      beforeEach(() => {
        session.units = 'gallons'
      })

      it('returns the unit of measurement as "Gallons"', () => {
        const result = CheckPresenter.go(session)

        expect(result.units).to.equal('Gallons')
      })
    })
  })
})

function _sessionData() {
  return {
    endDate: '2024-03-31T00:00:00.000Z',
    id: 'e840675e-9fb9-4ce1-bf0a-d140f5c57f47',
    journey: 'enterReturn',
    lines: [
      {
        endDate: '2023-04-30T00:00:00.000Z',
        startDate: '2023-04-01T00:00:00.000Z'
      },
      {
        endDate: '2023-05-31T00:00:00.000Z',
        startDate: '2023-05-01T00:00:00.000Z'
      },
      {
        endDate: '2023-06-30T00:00:00.000Z',
        startDate: '2023-06-01T00:00:00.000Z'
      }
    ],
    meter10TimesDisplay: 'yes',
    meterMake: 'Test meter make',
    meterProvided: 'yes',
    meterSerialNumber: '098765',
    periodEndDay: 31,
    periodEndMonth: 12,
    periodStartDay: 1,
    periodStartMonth: 1,
    purposes: ['Evaporative Cooling'],
    receivedDate: '2025-01-31T00:00:00.000Z',
    reported: 'abstractionVolumes',
    returnReference: '1234',
    returnsFrequency: 'month',
    siteDescription: 'POINT A, TEST SITE DESCRIPTION',
    startDate: '2023-04-01T00:00:00.000Z',
    twoPartTariff: false,
    units: 'megalitres'
  }
}
