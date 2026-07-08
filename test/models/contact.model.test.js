// Test helpers
import * as BillingAccountAddressHelper from '../support/helpers/billing-account-address.helper.js'
import BillingAccountAddressModel from '../../app/models/billing-account-address.model.js'
import * as CompanyContactHelper from '../support/helpers/company-contact.helper.js'
import CompanyContactModel from '../../app/models/company-contact.model.js'
import * as ContactHelper from '../support/helpers/contact.helper.js'
import * as LicenceDocumentRoleHelper from '../support/helpers/licence-document-role.helper.js'
import LicenceDocumentRoleModel from '../../app/models/licence-document-role.model.js'

// Thing under test
import ContactModel from '../../app/models/contact.model.js'

describe('Contact model', () => {
  let testBillingAccountAddresses
  let testCompanyContacts
  let testLicenceDocumentRoles
  let testRecord

  beforeAll(async () => {
    // Test record
    testRecord = await ContactHelper.add()

    // Link billing account addresses
    testBillingAccountAddresses = []
    for (let i = 0; i < 2; i++) {
      // NOTE: A constraint in the billing_account_addresses table means you cannot have 2 records with the same
      // billingAccountId and start date
      const startDate = i === 0 ? new Date(2023, 8, 4) : new Date(2023, 8, 3)
      const billingAccountAddress = await BillingAccountAddressHelper.add({ startDate, contactId: testRecord.id })

      testBillingAccountAddresses.push(billingAccountAddress)
    }

    // Link company contacts
    testCompanyContacts = []
    for (let i = 0; i < 2; i++) {
      const companyContact = await CompanyContactHelper.add({ contactId: testRecord.id })

      testCompanyContacts.push(companyContact)
    }

    // Link licence document roles
    testLicenceDocumentRoles = []
    for (let i = 0; i < 2; i++) {
      const licenceDocumentRole = await LicenceDocumentRoleHelper.add({ contactId: testRecord.id })

      testLicenceDocumentRoles.push(licenceDocumentRole)
    }
  })

  afterAll(async () => {
    for (const billingAccountAddress of testBillingAccountAddresses) {
      await billingAccountAddress.$query().delete()
    }

    for (const companyContact of testCompanyContacts) {
      await companyContact.$query().delete()
    }

    for (const licenceDocumentRole of testLicenceDocumentRoles) {
      await licenceDocumentRole.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ContactModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ContactModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to billing account addresses', () => {
      it('can successfully run a related query', async () => {
        const query = await ContactModel.query().innerJoinRelated('billingAccountAddresses')

        expect(query).toBeDefined()
      })

      it('can eager load the billing account addresses', async () => {
        const result = await ContactModel.query().findById(testRecord.id).withGraphFetched('billingAccountAddresses')

        expect(result).toBeInstanceOf(ContactModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billingAccountAddresses).toBeInstanceOf(Array)
        expect(result.billingAccountAddresses[0]).toBeInstanceOf(BillingAccountAddressModel)
        expect(result.billingAccountAddresses).toContainEqual(testBillingAccountAddresses[0])
        expect(result.billingAccountAddresses).toContainEqual(testBillingAccountAddresses[1])
      })
    })

    describe('when linking to company contacts', () => {
      it('can successfully run a related query', async () => {
        const query = await ContactModel.query().innerJoinRelated('companyContacts')

        expect(query).toBeDefined()
      })

      it('can eager load the company contacts', async () => {
        const result = await ContactModel.query().findById(testRecord.id).withGraphFetched('companyContacts')

        expect(result).toBeInstanceOf(ContactModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.companyContacts).toBeInstanceOf(Array)
        expect(result.companyContacts[0]).toBeInstanceOf(CompanyContactModel)
        expect(result.companyContacts).toContainEqual(testCompanyContacts[0])
        expect(result.companyContacts).toContainEqual(testCompanyContacts[1])
      })
    })

    describe('when linking to licence document roles', () => {
      it('can successfully run a related query', async () => {
        const query = await ContactModel.query().innerJoinRelated('licenceDocumentRoles')

        expect(query).toBeDefined()
      })

      it('can eager load the licence document roles', async () => {
        const result = await ContactModel.query().findById(testRecord.id).withGraphFetched('licenceDocumentRoles')

        expect(result).toBeInstanceOf(ContactModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceDocumentRoles).toBeInstanceOf(Array)
        expect(result.licenceDocumentRoles[0]).toBeInstanceOf(LicenceDocumentRoleModel)
        expect(result.licenceDocumentRoles).toContainEqual(testLicenceDocumentRoles[0])
        expect(result.licenceDocumentRoles).toContainEqual(testLicenceDocumentRoles[1])
      })
    })
  })

  // NOTE: The test data we generate in these tests is in accordance with how a contact record could be populated. For
  // example, if the data source is 'wrls' and the contact type is 'person', then first name and last name is always
  // populated. We don't test what would happen if last name wasn't because analysis of the data confirms this would
  // never happen. See the method's documentation for more details.
  describe('$name', () => {
    let nameTestRecord

    beforeEach(() => {
      nameTestRecord = ContactModel.fromJson({
        contactType: null,
        dataSource: null,
        department: null,
        firstName: null,
        initials: null,
        lastName: null,
        middleInitials: null,
        salutation: null,
        suffix: null
      })
    })

    describe('when the contact was imported in NALD', () => {
      beforeEach(() => {
        nameTestRecord.dataSource = 'nald'
      })

      describe('and has a last name of "Villar"', () => {
        beforeEach(() => {
          nameTestRecord.lastName = 'Villar'
        })

        it('returns "Villar"', () => {
          const result = nameTestRecord.$name()

          expect(result).toEqual('Villar')
        })

        describe('and the salutation "Mrs"', () => {
          beforeEach(() => {
            nameTestRecord.salutation = 'Mrs'
          })

          it('returns "Mrs Villar"', () => {
            const result = nameTestRecord.$name()

            expect(result).toEqual('Mrs Villar')
          })

          describe('and the initial "J"', () => {
            beforeEach(() => {
              nameTestRecord.initials = 'J'
            })

            it('returns "Mrs J Villar"', () => {
              const result = nameTestRecord.$name()

              expect(result).toEqual('Mrs J Villar')
            })
          })
        })

        describe('and a first name of "Margherita"', () => {
          beforeEach(() => {
            nameTestRecord.firstName = 'Margherita'
          })

          it('returns "Margherita Villar"', () => {
            const result = nameTestRecord.$name()

            expect(result).toEqual('Margherita Villar')
          })

          describe('and the salutation "Mrs"', () => {
            beforeEach(() => {
              nameTestRecord.salutation = 'Mrs'
            })

            it('returns "Mrs Margherita Villar"', () => {
              const result = nameTestRecord.$name()

              expect(result).toEqual('Mrs Margherita Villar')
            })

            describe('and the initial "J"', () => {
              beforeEach(() => {
                nameTestRecord.initials = 'J'
              })

              it('returns "Mrs J Villar"', () => {
                const result = nameTestRecord.$name()

                expect(result).toEqual('Mrs J Villar')
              })
            })
          })
        })
      })
    })

    describe('when the contact was entered into WRLS', () => {
      beforeEach(() => {
        nameTestRecord.dataSource = 'wrls'
      })

      describe('and it is a department named "Humanoid Risk Assessment"', () => {
        beforeEach(() => {
          nameTestRecord.contactType = 'department'
          nameTestRecord.department = 'Humanoid Risk Assessment'
        })

        it('returns "Humanoid Risk Assessment"', () => {
          const result = nameTestRecord.$name()

          expect(result).toEqual('Humanoid Risk Assessment')
        })
      })

      describe('and it is a "person"', () => {
        beforeEach(() => {
          nameTestRecord.contactType = 'person'
          nameTestRecord.firstName = 'Vincent'
          nameTestRecord.lastName = 'Anderson'
        })

        describe('with the name "Vincent Anderson"', () => {
          it('returns "Vincent Anderson"', () => {
            const result = nameTestRecord.$name()

            expect(result).toEqual('Vincent Anderson')
          })
        })

        describe('and the salutation "Mr"', () => {
          beforeEach(() => {
            nameTestRecord.salutation = 'Mr'
          })

          it('returns "Mr Vincent Anderson"', () => {
            const result = nameTestRecord.$name()

            expect(result).toEqual('Mr Vincent Anderson')
          })

          describe('and the middle initial "P"', () => {
            beforeEach(() => {
              nameTestRecord.middleInitials = 'P'
            })

            it('returns "Mr V P Anderson"', () => {
              const result = nameTestRecord.$name()

              expect(result).toEqual('Mr V P Anderson')
            })

            describe('and the suffix "MBE"', () => {
              beforeEach(() => {
                nameTestRecord.suffix = 'MBE'
              })

              it('returns "Mr V P Anderson MBE"', () => {
                const result = nameTestRecord.$name()

                expect(result).toEqual('Mr V P Anderson MBE')
              })
            })
          })
        })

        describe('and the middle initial "P"', () => {
          beforeEach(() => {
            nameTestRecord.middleInitials = 'P'
          })

          it('returns "V P Anderson"', () => {
            const result = nameTestRecord.$name()

            expect(result).toEqual('V P Anderson')
          })

          describe('and the suffix "MBE"', () => {
            beforeEach(() => {
              nameTestRecord.suffix = 'MBE'
            })

            it('returns "V P Anderson MBE"', () => {
              const result = nameTestRecord.$name()

              expect(result).toEqual('V P Anderson MBE')
            })
          })
        })
      })
    })
  })
})
