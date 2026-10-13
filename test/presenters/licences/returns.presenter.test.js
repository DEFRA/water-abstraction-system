// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { generateLicenceRef } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import ReturnsPresenter from '../../../src/presenters/licences/returns.presenter.js'

describe('Licences - Returns presenter', () => {
  let returnLogs
  let hasRequirements
  let licence

  beforeEach(() => {
    hasRequirements = true
    returnLogs = _returnLogs()

    licence = {
      licenceRef: generateLicenceRef()
    }
  })

  it('returns page data for the view', () => {
    const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

    expect(result).toEqual({
      backLink: {
        text: 'Go back to search',
        href: '/'
      },
      noReturnsMessage: null,
      pageTitle: 'Returns',
      pageTitleCaption: `Licence ${licence.licenceRef}`,
      returns: [
        {
          dates: '2 January 2020 to 1 February 2020',
          description: 'BOREHOLE AT AVALON',
          dueDate: '28 November 2020',
          link: '/system/return-logs/c4458436-4766-4271-b978-6af7a0e4fd95/details',
          purposes: ['Spray Irrigation - Direct (The Big One)'],
          reference: '10046821',
          status: 'complete'
        },
        {
          dates: '2 January 2020 to 1 February 2020',
          description: 'BOREHOLE AT AVALON',
          dueDate: '28 November 2020',
          link: '/system/return-logs/2e35c9c6-5017-46ea-8fa8-8960dc1a8ae7/details',
          purposes: ['Spray Irrigation - Direct (The Big One)'],
          reference: '10046820',
          status: 'overdue'
        }
      ]
    })
  })

  describe('the "noReturnsMessage" property', () => {
    describe('when a licence has returns and requirements', () => {
      it('returns null', () => {
        const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

        expect(result.noReturnsMessage).toBeNull()
      })
    })

    describe('when a licence has NO requirements and NO returns', () => {
      beforeEach(() => {
        returnLogs = []
        hasRequirements = false
      })

      it('returns the message "No requirements for returns have been set up for this licence."', () => {
        const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

        expect(result.noReturnsMessage).toEqual('No requirements for returns have been set up for this licence.')
      })
    })

    describe('when a licence has requirements but NO returns', () => {
      beforeEach(() => {
        returnLogs = []
      })

      it('returns the message "No returns for this licence."', () => {
        const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

        expect(result.noReturnsMessage).toEqual('No returns for this licence.')
      })
    })
  })

  describe('the "returns" property', () => {
    describe('the "description" property', () => {
      describe('when the site description is set', () => {
        it('returns the site description', () => {
          const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

          expect(result.returns[0].description).toEqual('BOREHOLE AT AVALON')
        })
      })

      describe('when the site description is null', () => {
        beforeEach(() => {
          returnLogs[0].siteDescription = null
        })

        it('returns an empty string', () => {
          const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

          expect(result.returns[0].description).toEqual('')
        })
      })
    })

    describe('the "dueDate" property', () => {
      describe('when the due date is set', () => {
        it('returns the formatted due date', () => {
          const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

          expect(result.returns[0].dueDate).toEqual('28 November 2020')
        })
      })

      describe('when the due date is "null"', () => {
        beforeEach(() => {
          returnLogs[0].dueDate = null
        })

        it('returns an empty string', () => {
          const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

          expect(result.returns[0].dueDate).toEqual('')
        })
      })
    })

    describe('the "purposes" property', () => {
      describe('when return log is linked to a purpose', () => {
        describe('and the purpose has been given an "alias" in the return requirement purpose', () => {
          describe('and the alias is different from the description', () => {
            it('returns the purpose description and the alias', () => {
              const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

              expect(result.returns[0].purposes).toEqual(['Spray Irrigation - Direct (The Big One)'])
            })
          })

          describe('and the alias is the same as the description', () => {
            beforeEach(() => {
              returnLogs[0].purposes = [
                { alias: 'Spray Irrigation - Direct', description: 'Spray Irrigation - Direct' }
              ]
            })

            it('returns the purpose description and the alias', () => {
              const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

              expect(result.returns[0].purposes).toEqual(['Spray Irrigation - Direct'])
            })
          })
        })

        describe('and the purpose does not have an "alias" in the return requirement purpose', () => {
          beforeEach(() => {
            returnLogs[0].purposes = [{ alias: null, description: 'Spray Irrigation - Direct' }]
          })

          it('returns just the purpose description', () => {
            const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

            expect(result.returns[0].purposes).toEqual(['Spray Irrigation - Direct'])
          })
        })
      })

      describe('when return log is linked to multiple purposes', () => {
        beforeEach(() => {
          returnLogs[0].purposes.push({ alias: null, description: 'Spray Irrigation - Indirect' })
        })

        it('returns all the formatted purposes', () => {
          const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

          expect(result.returns[0].purposes).toEqual([
            'Spray Irrigation - Direct (The Big One)',
            'Spray Irrigation - Indirect'
          ])
        })
      })

      describe('when return log is not linked to any purposes', () => {
        beforeEach(() => {
          returnLogs[0].purposes = []
        })

        it('returns an empty array', () => {
          const result = ReturnsPresenter(returnLogs, hasRequirements, licence)

          expect(result.returns[0].purposes).toEqual([])
        })
      })
    })
  })
})

function _returnLogs() {
  const returnLog = {
    id: 'c4458436-4766-4271-b978-6af7a0e4fd95',
    dueDate: new Date('2020-11-28'),
    status: 'completed',
    startDate: new Date('2020/01/02'),
    endDate: new Date('2020/02/01'),
    purposes: [{ alias: 'The Big One', description: 'Spray Irrigation - Direct' }],
    returnId: 'v1:1:01/123:10046821:2020-01-02:2020-02-01',
    returnReference: '10046821',
    siteDescription: 'BOREHOLE AT AVALON'
  }

  return [
    { ...returnLog },
    {
      ...returnLog,
      id: '2e35c9c6-5017-46ea-8fa8-8960dc1a8ae7',
      status: 'due',
      returnId: 'v1:1:01/123:10046820:2020-01-02:2020-02-01',
      returnReference: '10046820'
    }
  ]
}
