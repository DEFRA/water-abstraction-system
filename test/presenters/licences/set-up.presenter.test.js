'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const SetUpPresenter = require('../../../app/presenters/licences/set-up.presenter.js')

describe('Licence Set Up presenter', () => {
  const agreement = {
    id: '123',
    startDate: new Date('2020-01-01'),
    endDate: null,
    dateSigned: null,
    financialAgreements: [{ financialAgreementCode: 'S127' }]
  }

  const chargeVersion = {
    id: '0d514aa4-1550-46b1-8195-878957f2a5f8',
    startDate: new Date('2020-01-01'),
    endDate: new Date('2020-09-01'),
    status: 'current',
    changeReason: { description: 'Major change' },
    licenceId: 'f91bf145-ce8e-481c-a842-4da90348062b'
  }

  const returnVersion = {
    id: '0312e5eb-67ae-44fb-922c-b1a0b81bc08d',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-02-01'),
    status: 'current',
    reason: 'change-to-special-agreement'
  }

  const workflow = {
    id: 'f547f465-0a62-45ff-9909-38825f05e0c4',
    createdAt: new Date('2020-01-01'),
    status: 'review',
    data: { chargeVersion: { changeReason: { description: 'changed something' } } },
    licenceId: 'f91bf145-ce8e-481c-a842-4da90348062b'
  }

  let agreements
  let auth
  let chargeVersions
  let commonData
  let returnVersions
  let workflows

  beforeEach(() => {
    auth = {
      isValid: true,
      credentials: {
        user: { id: 123 },
        roles: ['billing', 'charge_version_workflow_editor'],
        groups: [],
        scope: ['billing', 'charge_version_workflow_editor'],
        permissions: { abstractionReform: false, billRuns: true, manage: true }
      }
    }

    const lessThanSixYearsAgo = new Date()

    commonData = {
      licenceId: 'f91bf145-ce8e-481c-a842-4da90348062b',
      ends: {
        date: lessThanSixYearsAgo
      }
    }

    agreements = []
    chargeVersions = []
    returnVersions = []
    workflows = []
  })

  describe('when provided with populated licence set up data', () => {
    describe('that includes licence agreements', () => {
      beforeEach(() => {
        agreement.endDate = null
        agreements = [{ ...agreement }]
        chargeVersions = []
        workflows = []

        commonData.includeInPresrocBilling = 'no'

        auth.credentials.roles = [...auth.credentials.roles, 'manage_agreements', 'delete_agreements']
        auth.credentials.scope = [...auth.credentials.scope, 'manage_agreements', 'delete_agreements']
      })

      it('correctly presents the agreements data', () => {
        const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

        expect(result.agreements).to.equal([
          {
            action: [
              {
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/agreements/123/delete',
                text: 'Delete'
              },
              {
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/agreements/123/end',
                text: 'End'
              },
              {
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/mark-for-supplementary-billing',
                text: 'Recalculate bills'
              }
            ],
            dateSigned: '',
            description: 'Two-part tariff',
            endDate: '',
            startDate: '1 January 2020'
          }
        ])
      })

      describe('when all the actions are available for an agreement', () => {
        it('shows delete, end and recalculate bills actions', () => {
          const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

          expect(result.agreements[0].action).to.equal([
            {
              link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/agreements/123/delete',
              text: 'Delete'
            },
            {
              link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/agreements/123/end',
              text: 'End'
            },
            {
              link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/mark-for-supplementary-billing',
              text: 'Recalculate bills'
            }
          ])
        })
      })

      describe('when actions are not available for an agreement', () => {
        describe('when the user can not manage agreements', () => {
          beforeEach(() => {
            auth.credentials.scope = []
          })

          it('there are no actions', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

            expect(result.agreements[0].action).to.equal([])
          })
        })

        describe('when the user does not have permission to delete an agreement', () => {
          beforeEach(() => {
            auth.credentials.scope = ['billing', 'manage_agreements']
          })

          it('there is no action link to delete', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

            expect(result.agreements[0].action).to.equal([
              {
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/agreements/123/end',
                text: 'End'
              },
              {
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/mark-for-supplementary-billing',
                text: 'Recalculate bills'
              }
            ])
          })
        })

        describe('when a licence has ended', () => {
          beforeEach(() => {
            agreements = [{ ...agreement, endDate: new Date() }]
          })

          it('there is no action link to end the agreement', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

            expect(result.agreements[0].action).to.equal([
              {
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/agreements/123/delete',
                text: 'Delete'
              }
            ])
          })
        })

        describe('when user can not Recalculate bills for an agreement because of pre sroc billing', () => {
          beforeEach(() => {
            commonData.includeInPresrocBilling = 'yes'
          })

          it('there is no action link to Recalculate bills', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

            expect(result.agreements[0].action).to.equal([
              {
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/agreements/123/delete',
                text: 'Delete'
              },
              {
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/agreements/123/end',
                text: 'End'
              }
            ])
          })
        })
      })

      describe('when the financial agreement code ', () => {
        describe('is for Two-part tariff ', () => {
          beforeEach(() => {
            agreement.financialAgreements[0].financialAgreementCode = 'S127'
          })
          it('correctly maps the code to the description', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

            expect(result.agreements[0].description).to.equal('Two-part tariff')
          })
        })

        describe('is for Canal and Rivers Trust, supported source (S130S) ', () => {
          beforeEach(() => {
            agreement.financialAgreements[0].financialAgreementCode = 'S130S'
          })
          it('correctly maps the code to the description', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

            expect(result.agreements[0].description).to.equal('Canal and Rivers Trust, supported source (S130S)')
          })
        })

        describe('is for Canal and Rivers Trust, unsupported source (S130U)', () => {
          beforeEach(() => {
            agreement.financialAgreements[0].financialAgreementCode = 'S130U'
          })
          it('correctly maps the code to the description', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

            expect(result.agreements[0].description).to.equal('Canal and Rivers Trust, unsupported source (S130U)')
          })
        })

        describe('is for Abatement', () => {
          beforeEach(() => {
            agreement.financialAgreements[0].financialAgreementCode = 'S126'
          })
          it('correctly maps the code to the description', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

            expect(result.agreements[0].description).to.equal('Abatement')
          })
        })
      })

      describe('when the licence is less than 6 years old and all the actions are available for an agreement', () => {
        beforeEach(() => {
          agreement.financialAgreements[0].financialAgreementCode = 'S127'
        })

        it('shows delete, end and recalculate bills actions', () => {
          const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

          expect(result.agreements[0].action).to.equal([
            {
              link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/agreements/123/delete',
              text: 'Delete'
            },
            {
              link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/agreements/123/end',
              text: 'End'
            },
            {
              link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/mark-for-supplementary-billing',
              text: 'Recalculate bills'
            }
          ])
        })
      })

      describe('when the licence is more than 6 years old and all the actions are available for an agreement', () => {
        beforeEach(() => {
          const sixYearsAndOneDayAgo = new Date()
          sixYearsAndOneDayAgo.setDate(sixYearsAndOneDayAgo.getDate() - 1)
          sixYearsAndOneDayAgo.setFullYear(sixYearsAndOneDayAgo.getFullYear() - 6)

          commonData.ends = {
            date: sixYearsAndOneDayAgo
          }
        })

        it('shows delete, end and recalculate bills actions', () => {
          const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

          expect(result.agreements[0].action).to.equal([])
        })
      })
    })

    describe('that includes both charge versions and workflows', () => {
      beforeEach(() => {
        agreements = []
        chargeVersions = [{ ...chargeVersion }]
        workflows = [{ ...workflow }]
      })

      it('groups both types of data into the \'chargeInformation\' property', () => {
        const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

        expect(result.chargeInformation).to.equal([
          {
            action: [],
            id: 'f547f465-0a62-45ff-9909-38825f05e0c4',
            startDate: '1 January 2020',
            endDate: '-',
            status: 'review',
            reason: 'changed something'
          },
          {
            action: [{
              link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/0d514aa4-1550-46b1-8195-878957f2a5f8/view',
              text: 'View'
            }],
            id: '0d514aa4-1550-46b1-8195-878957f2a5f8',
            startDate: '1 January 2020',
            endDate: '1 September 2020',
            status: 'approved',
            reason: 'Major change'
          }
        ])
      })
    })

    describe('that includes charge versions', () => {
      beforeEach(() => {
        agreements = []
        workflows = []
      })

      describe('where the end date is not populated', () => {
        beforeEach(() => {
          chargeVersions = [{ ...chargeVersion }]
          chargeVersions[0].endDate = null
        })

        it('correctly presents the data with a dash for the end date', () => {
          const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

          expect(result.chargeInformation).to.equal([{
            action: [{
              link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/0d514aa4-1550-46b1-8195-878957f2a5f8/view',
              text: 'View'
            }],
            id: '0d514aa4-1550-46b1-8195-878957f2a5f8',
            startDate: '1 January 2020',
            endDate: '-',
            status: 'approved',
            reason: 'Major change'
          }])
        })
      })

      describe('where the end date is populated', () => {
        beforeEach(() => {
          chargeVersions = [{ ...chargeVersion }]
        })

        it('correctly presents the data with the end date', () => {
          const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

          expect(result.chargeInformation).to.equal([{
            action: [{
              link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/0d514aa4-1550-46b1-8195-878957f2a5f8/view',
              text: 'View'
            }],
            id: '0d514aa4-1550-46b1-8195-878957f2a5f8',
            startDate: '1 January 2020',
            endDate: '1 September 2020',
            status: 'approved',
            reason: 'Major change'
          }])
        })
      })
    })

    describe('that includes workflow records', () => {
      beforeEach(() => {
        chargeVersions = []
      })

      describe('that have a status of \'review\'', () => {
        beforeEach(() => {
          workflows = [{ ...workflow }]
        })

        describe('and the user is permitted to review workflow records', () => {
          beforeEach(() => {
            auth.credentials.scope = ['billing', 'charge_version_workflow_reviewer']
          })

          it('correctly presents the data and workflow actions', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

            expect(result.chargeInformation).to.equal([{
              action: [{
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/f547f465-0a62-45ff-9909-38825f05e0c4/review',
                text: 'Review'
              }],
              id: 'f547f465-0a62-45ff-9909-38825f05e0c4',
              startDate: '1 January 2020',
              endDate: '-',
              status: 'review',
              reason: 'changed something'
            }])
          })
        })

        describe('and the user is not permitted to review workflow records', () => {
          it('correctly presents the data and workflow actions', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

            expect(result.chargeInformation).to.equal([{
              action: [],
              id: 'f547f465-0a62-45ff-9909-38825f05e0c4',
              startDate: '1 January 2020',
              endDate: '-',
              status: 'review',
              reason: 'changed something'
            }])
          })
        })
      })

      describe('that have a status of \'to_setup\'', () => {
        beforeEach(() => {
          workflows = [{ ...workflow }]
          workflows[0].status = 'to_setup'
        })

        describe('and the user is permitted to edit workflow records', () => {
          beforeEach(() => {
            auth.credentials.scope = ['billing', 'charge_version_workflow_reviewer']
          })

          it('correctly presents the data and workflow actions', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

            expect(result.chargeInformation).to.equal([{
              action: [{
                link: '/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/f547f465-0a62-45ff-9909-38825f05e0c4/review',
                text: 'Review'
              }],
              id: 'f547f465-0a62-45ff-9909-38825f05e0c4',
              startDate: '1 January 2020',
              endDate: '-',
              status: 'to set up',
              reason: 'changed something'
            }])
          })
        })

        describe('and the user is not permitted to edit workflow records', () => {
          beforeEach(() => {
            auth.credentials.scope = ['billing']
          })

          it('correctly presents the data and workflow actions', () => {
            const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

            expect(result.chargeInformation).to.equal([{
              action: [],
              id: 'f547f465-0a62-45ff-9909-38825f05e0c4',
              startDate: '1 January 2020',
              endDate: '-',
              status: 'to set up',
              reason: 'changed something'
            }])
          })
        })
      })
    })

    describe('that includes return versions', () => {
      beforeEach(() => {
        returnVersions = [{ ...returnVersion }]
      })

      it('correctly presents the returns versions data', () => {
        const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

        expect(result.returnVersions).to.equal([
          {
            action: [
              {
                link: '',
                text: 'View'
              }
            ],
            endDate: '1 February 2025',
            reason: 'Change to special agreement',
            startDate: '1 January 2025',
            status: 'approved'
          }
        ])
      })

      describe('and the data is missing', () => {
        beforeEach(() => {
          returnVersions = [{ ...returnVersion, endDate: null, reason: null }]
        })

        it('correctly presents the returns versions data with the missing data defaults', () => {
          const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

          expect(result.returnVersions).to.equal([
            {
              action: [
                {
                  link: '',
                  text: 'View'
                }
              ],
              endDate: '',
              reason: '',
              startDate: '1 January 2025',
              status: 'approved'
            }
          ])
        })
      })
    })

    describe('the "links" property', () => {
      beforeEach(() => {
        agreements = []
        chargeVersions = [{ ...chargeVersion }]
        workflows = [{ ...workflow }]
      })

      describe('when the user wants to manage agreements', () => {
        describe('when the user can set up agreements', () => {
          describe('and the licence does not end more than 6 years ago', () => {
            beforeEach(() => {
              agreements = [{ ...agreement }]

              auth.credentials.scope.push('manage_agreements')
            })

            it('correctly presents the set up agreement link ', () => {
              const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

              expect(result.links.agreements.setUpAgreement).to.equal('/licences/f91bf145-ce8e-481c-a842-4da90348062b/agreements/select-type')
            })
          })
        })

        describe('when the user can not set up agreements ', () => {
          describe('and the user does not have permission', () => {
            beforeEach(() => {
              agreements = [{ ...agreement }]

              auth.credentials.scope = []
            })

            it('the agreement link is not present', () => {
              const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

              expect(result.links.agreements.setUpAgreement).to.be.undefined()
            })
          })

          describe('and the licence ends more than 6 years ago', () => {
            beforeEach(() => {
              const sixYearsAndOneDayAgo = new Date()
              sixYearsAndOneDayAgo.setDate(sixYearsAndOneDayAgo.getDate() - 1)
              sixYearsAndOneDayAgo.setFullYear(sixYearsAndOneDayAgo.getFullYear() - 6)

              commonData.ends = {
                date: sixYearsAndOneDayAgo
              }

              agreements = [{ ...agreement }]
            })

            it('the agreement link is not present', () => {
              const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

              expect(result.setUpAgreement).to.be.undefined()
            })
          })
        })
      })

      describe('when the user wants to manage charge information', () => {
        describe('and the user can edit a workflow  ', () => {
          describe('and the licence does not end more than 6 years ago', () => {
            it('return the associated links', () => {
              const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

              expect(result.links.chargeInformation.makeLicenceNonChargeable).to
                .equal('/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/non-chargeable-reason?start=1')
              expect(result.links.chargeInformation.setupNewCharge).to
                .equal('/licences/f91bf145-ce8e-481c-a842-4da90348062b/charge-information/create')
            })
          })
          describe('and the licence \'ends\' more than 6 years ago', () => {
            beforeEach(() => {
              const sixYearsAndOneDayAgo = new Date()
              sixYearsAndOneDayAgo.setDate(sixYearsAndOneDayAgo.getDate() - 1)
              sixYearsAndOneDayAgo.setFullYear(sixYearsAndOneDayAgo.getFullYear() - 6)

              commonData.ends = {
                date: sixYearsAndOneDayAgo
              }

              chargeVersions = []
              workflows = [{ ...workflow }]
              agreements = []
            })

            it('returns no links for editing', () => {
              const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

              expect(result.links.chargeInformation.makeLicenceNonChargeable).to.be.undefined()
              expect(result.links.chargeInformation.setupNewCharge).to.be.undefined()
            })
          })
        })
      })

      describe('when the user wants to manage return versions', () => {
        it('return the associated links', () => {
          const result = SetUpPresenter.go(chargeVersions, workflows, agreements, returnVersions, auth, commonData)

          expect(result.links.returnVersions.returnsRequired).to
            .equal('/system/licences/f91bf145-ce8e-481c-a842-4da90348062b/returns-required')
          expect(result.links.returnVersions.noReturnsRequired).to
            .equal('/system/licences/f91bf145-ce8e-481c-a842-4da90348062b/no-returns-required')
        })
      })
    })
  })
})
