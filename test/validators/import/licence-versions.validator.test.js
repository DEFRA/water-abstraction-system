'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FixtureImportLicenceVersions = require('../../services/import/_fixtures/import-licence-versions.fixture.js')

// Thing under test
const ImportLicenceVersionsValidator = require('../../../app/validators/import/licence-versions.validator.js')

describe('Import licence versions validator', () => {
  let licenceVersion
  let licenceVersionPurpose
  let licenceVersionPurposes
  let licenceVersionsAndPurposes

  before(async () => {
    licenceVersionsAndPurposes = FixtureImportLicenceVersions.create()

    licenceVersion = licenceVersionsAndPurposes[0]
    licenceVersionPurpose = licenceVersion.purposes[0]
    licenceVersionPurposes = licenceVersion.purposes
  })

  it('should not throw if all the required fields validations are met', () => {
    expect(() => {
      return ImportLicenceVersionsValidator.go(licenceVersionsAndPurposes)
    }).to.not.throw()
  })

  it('should throw if there are no licence versions', () => {
    expect(() => {
      return ImportLicenceVersionsValidator.go([])
    }).to.throw('A licence must have at least one Licence version')
  })

  describe('the "version"', () => {
    describe('"endDate" property', () => {
      it('should throw an error if "endDate" is not a valid date or null', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              endDate: 1
            }
          ])
        }).to.throw('"[0].endDate" must be a valid date')
      })

      it('should throw an error if "endDate" does not meet ISO 8601', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              endDate: '01/01/2001'
            }
          ])
        }).to.throw('"[0].endDate" must be in ISO 8601 date format')
      })

      it('should not throw an error if "endDate" is null', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              endDate: null
            }
          ])
        }).to.not.throw()
      })

      it('should not throw an error if "endDate" is valid date', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              endDate: '2001-01-01'
            }
          ])
        }).to.not.throw()
      })
    })

    describe('"externalId" property', () => {
      it('should throw an error - externalId - must be a string', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              externalId: null
            }
          ])
        }).to.throw('"[0].externalId" must be a string')
      })

      it('should throw an error - externalId - is required', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              endDate: null
            }
          ])
        }).to.throw('"[0].externalId" is required')
      })

      it('should not throw an error if "externalId" is a string', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes
            }
          ])
        }).to.not.throw()
      })
    })

    describe('"increment" property', () => {
      it('should throw an error - increment - must be a number', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              increment: '1a'
            }
          ])
        }).to.throw('"[0].increment" must be a number')
      })

      it('should throw an error - increment - is required', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              endDate: null,
              externalId: '1:2:3'
            }
          ])
        }).to.throw('"[0].increment" is required')
      })

      it('should not throw an error if "increment" is a number', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes
            }
          ])
        }).to.not.throw()
      })
    })

    describe('"issue" property', () => {
      it('should throw an error - issue - must be a number', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              issue: '1a'
            }
          ])
        }).to.throw('"[0].issue" must be a number')
      })

      it('should throw an error - issue - is required', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              endDate: null,
              externalId: '1:2:3',
              increment: 1
            }
          ])
        }).to.throw('"[0].issue" is required')
      })

      it('should not throw an error if "issue" is a number', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes
            }
          ])
        }).to.not.throw()
      })
    })

    describe('"status" property', () => {
      it('should throw an error - status - must be a string', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              status: 1
            }
          ])
        }).to.throw('"[0].status" must be a string')
      })

      it('should throw an error - status - is required', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              endDate: null,
              externalId: '1:2:3',
              increment: 1,
              issue: 1,
              startDate: '2001-01-01'
            }
          ])
        }).to.throw('"[0].status" is required')
      })

      it('should throw an error - status - is not a valid status', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              status: 'draft'
            }
          ])
        }).to.throw('"[0].status" failed custom validation because Status must be one of current,superseded')
      })

      it('should not throw an error if "status" is a valid status', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes
            }
          ])
        }).to.not.throw()
      })
    })

    describe('"startDate" property', () => {
      it('should throw an error if "startDate" is not a valid date', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              startDate: 1
            }
          ])
        }).to.throw('"[0].startDate" must be a valid date')
      })

      it('should throw an error if "startDate" does not meet ISO 8601', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              startDate: '01/01/2001'
            }
          ])
        }).to.throw('"[0].startDate" must be in ISO 8601 date format')
      })

      it('should throw an error if "startDate" is null', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              startDate: null
            }
          ])
        }).to.throw('"[0].startDate" must be a valid date')
      })

      it('should not throw an error if "startDate" is valid date string', async () => {
        expect(() => {
          return ImportLicenceVersionsValidator.go([
            {
              ...licenceVersion,
              purposes: licenceVersionPurposes,
              startDate: '2001-01-01'
            }
          ])
        }).to.not.throw()
      })
    })

    describe('"purposes" property', () => {
      describe('when no purposes a', () => {
        let licenceVersionNoPurposes

        beforeEach(() => {
          licenceVersionNoPurposes = FixtureImportLicenceVersions.create()

          licenceVersionNoPurposes[0].purposes = []
        })

        it('should throw if there are no licence versions', () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go(licenceVersionNoPurposes)
          }).to.throw('A licence version must have at least one Licence version purpose')
        })
      })

      describe('"abstractionPeriodEndDay" property', () => {
        it('should throw an error if "abstractionPeriodEndDay" is not a number', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodEndDay: '1a' }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodEndDay" must be a number')
        })

        it('should throw an error if "abstractionPeriodEndDay" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodEndDay: null }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodEndDay" must be a number')
        })

        it('should throw an error if "abstractionPeriodEndDay" is less than 1 (days allowed 1 - 31)', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodEndDay: -1 }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodEndDay" must be greater than or equal to 1')
        })

        it('should throw an error if "abstractionPeriodEndDay" is more than 31 (days allowed 1 -31)', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodEndDay: 34 }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodEndDay" must be less than or equal to 31')
        })

        it('should not throw an error if "abstractionPeriodEndDay" is a number within 1 - 31', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodEndDay: 1 }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"abstractionPeriodEndMonth" property', () => {
        it('should throw an error if "abstractionPeriodEndMonth" is not a number', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodEndMonth: '1a' }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodEndMonth" must be a number')
        })

        it('should throw an error if "abstractionPeriodEndMonth" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodEndMonth: null }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodEndMonth" must be a number')
        })

        it('should throw an error if "abstractionPeriodEndMonth" is less than 1 (months are 1 - 12)', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodEndMonth: -1 }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodEndMonth" must be greater than or equal to 1')
        })

        it('should throw an error if "abstractionPeriodEndMonth" is more than 12 (months are 1 - 12)', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodEndMonth: 14 }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodEndMonth" must be less than or equal to 12')
        })

        it('should not throw an error if "abstractionPeriodEndMonth" is a number within 1 - 12', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodEndMonth: 1 }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"abstractionPeriodStartDay" property', () => {
        it('should throw an error if "abstractionPeriodStartDay" is not a number', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodStartDay: '1a' }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodStartDay" must be a number')
        })

        it('should throw an error if "abstractionPeriodStartDay" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodStartDay: null }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodStartDay" must be a number')
        })

        it('should throw an error if "abstractionPeriodStartDay" is less than 1 (days allowed 1 - 31)', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodStartDay: -1 }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodStartDay" must be greater than or equal to 1')
        })

        it('should throw an error if "abstractionPeriodStartDay" is more than 31 (days allowed 1 -31)', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodStartDay: 34 }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodStartDay" must be less than or equal to 31')
        })

        it('should not throw an error if "abstractionPeriodStartDay" is a number within 1 - 31', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodStartDay: 1 }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"abstractionPeriodStartMonth" property', () => {
        it('should throw an error if "abstractionPeriodStartMonth" is not a number', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodStartMonth: '1a' }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodStartMonth" must be a number')
        })

        it('should throw an error if "abstractionPeriodStartMonth" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodStartMonth: null }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodStartMonth" must be a number')
        })

        it('should throw an error if "abstractionPeriodStartMonth" is less than 1 (months are 1 - 12)', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodStartMonth: -1 }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodStartMonth" must be greater than or equal to 1')
        })

        it('should throw an error if "abstractionPeriodStartMonth" is more than 12 (months are 1 - 12)', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodStartMonth: 14 }]
              }
            ])
          }).to.throw('"[0].purposes[0].abstractionPeriodStartMonth" must be less than or equal to 12')
        })

        it('should not throw an error if "abstractionPeriodStartMonth" is a number within 1 - 12', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, abstractionPeriodStartMonth: 1 }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"annualQuantity" property', () => {
        it('should throw an error if "annualQuantity" is not a number or null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, annualQuantity: '1a' }]
              }
            ])
          }).to.throw('"[0].purposes[0].annualQuantity" must be a number')
        })

        it('should not throw an error if "annualQuantity" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, annualQuantity: null }]
              }
            ])
          }).to.not.throw()
        })

        it('should not throw an error if "annualQuantity" is a number', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, annualQuantity: 52311 }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"dailyQuantity" property', () => {
        it('should throw an error if "dailyQuantity" is not a number or null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, dailyQuantity: '1a' }]
              }
            ])
          }).to.throw('"[0].purposes[0].dailyQuantity" must be a number')
        })

        it('should not throw an error if "dailyQuantity" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, dailyQuantity: null }]
              }
            ])
          }).to.not.throw()
        })

        it('should not throw an error if "dailyQuantity" is a number', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, dailyQuantity: 503.45 }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"hourlyQuantity" property', () => {
        it('should throw an error if "hourlyQuantity" is not a number or null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, hourlyQuantity: '1a' }]
              }
            ])
          }).to.throw('"[0].purposes[0].hourlyQuantity" must be a number')
        })

        it('should not throw an error if "hourlyQuantity" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, hourlyQuantity: null }]
              }
            ])
          }).to.not.throw()
        })

        it('should not throw an error if "hourlyQuantity" is a number', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, hourlyQuantity: 109.25 }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"instantQuantity" property', () => {
        it('should throw an error if "instantQuantity" is not a number or null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, instantQuantity: '1a' }]
              }
            ])
          }).to.throw('"[0].purposes[0].instantQuantity" must be a number')
        })

        it('should not throw an error if "instantQuantity" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, instantQuantity: null }]
              }
            ])
          }).to.not.throw()
        })

        it('should not throw an error if "instantQuantity" is a number', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, instantQuantity: 109 }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"primaryPurposeId" property', () => {
        it('should throw an error if "primaryPurposeId" is not a string or null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, primaryPurposeId: 1 }]
              }
            ])
          }).to.throw('"[0].purposes[0].primaryPurposeId" must be a string')
        })

        it('should throw an error if "primaryPurposeId" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, primaryPurposeId: null }]
              }
            ])
          }).to.throw('"[0].purposes[0].primaryPurposeId" must be a string')
        })

        it('should not throw an error if "primaryPurposeId" is a string', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, primaryPurposeId: 'I' }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"secondaryPurposeId" property', () => {
        it('should throw an error if "secondaryPurposeId" is not a string or null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, secondaryPurposeId: 1 }]
              }
            ])
          }).to.throw('"[0].purposes[0].secondaryPurposeId" must be a string')
        })

        it('should throw an error if "secondaryPurposeId" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, secondaryPurposeId: null }]
              }
            ])
          }).to.throw('"[0].purposes[0].secondaryPurposeId" must be a string')
        })

        it('should not throw an error if "secondaryPurposeId" is a string', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, secondaryPurposeId: 'OTI' }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"purposeId" property', () => {
        it('should throw an error if "purposeId" is not a string or null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, purposeId: 1 }]
              }
            ])
          }).to.throw('"[0].purposes[0].purposeId" must be a string')
        })

        it('should throw an error if "purposeId" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, purposeId: null }]
              }
            ])
          }).to.throw('"[0].purposes[0].purposeId" must be a string')
        })

        it('should not throw an error if "purposeId" is a string', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, purposeId: '160' }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"notes" property', () => {
        it('should throw an error if "notes" is string or null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, notes: 1 }]
              }
            ])
          }).to.throw('"[0].purposes[0].notes" must be a string')
        })

        it('should not throw an error if "notes" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, notes: null }]
              }
            ])
          }).to.not.throw()
        })

        it('should not throw an error if "notes" is a string', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, notes: 'a fancy note' }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"externalId" property', () => {
        it('should throw an error if "externalId" is not a string or null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, externalId: 1 }]
              }
            ])
          }).to.throw('"[0].purposes[0].externalId" must be a string')
        })

        it('should throw an error if "externalId" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, externalId: null }]
              }
            ])
          }).to.throw('"[0].purposes[0].externalId" must be a string')
        })

        it('should not throw an error if "externalId" is a string', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, externalId: '1:900' }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"timeLimitedEndDate" property', () => {
        it('should throw an error if "timeLimitedEndDate" is not a valid date', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, timeLimitedEndDate: 1 }]
              }
            ])
          }).to.throw('"[0].purposes[0].timeLimitedEndDate" must be a valid date')
        })

        it('should throw an error if "timeLimitedEndDate" does not meet ISO 8601', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, timeLimitedEndDate: '01/01/2001' }]
              }
            ])
          }).to.throw('"[0].purposes[0].timeLimitedEndDate" must be in ISO 8601 date format')
        })

        it('should not throw an error if "timeLimitedEndDate" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, timeLimitedEndDate: null }]
              }
            ])
          }).to.not.throw()
        })

        it('should not throw an error if "timeLimitedEndDate" is valid date string', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, timeLimitedEndDate: '2001-01-01' }]
              }
            ])
          }).to.not.throw()
        })
      })

      describe('"timeLimitedStartDate" property', () => {
        it('should throw an error if "timeLimitedStartDate" is not a valid date', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, timeLimitedStartDate: 1 }]
              }
            ])
          }).to.throw('"[0].purposes[0].timeLimitedStartDate" must be a valid date')
        })

        it('should throw an error if "timeLimitedStartDate" does not meet ISO 8601', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, timeLimitedStartDate: '01/01/2001' }]
              }
            ])
          }).to.throw('"[0].purposes[0].timeLimitedStartDate" must be in ISO 8601 date format')
        })

        it('should not throw an error if "timeLimitedStartDate" is null', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, timeLimitedStartDate: null }]
              }
            ])
          }).to.not.throw()
        })

        it('should not throw an error if "timeLimitedStartDate" is valid date string', async () => {
          expect(() => {
            return ImportLicenceVersionsValidator.go([
              {
                ...licenceVersion,
                purposes: [{ ...licenceVersionPurpose, timeLimitedStartDate: '2001-01-01' }]
              }
            ])
          }).to.not.throw()
        })
      })
    })
  })
})
