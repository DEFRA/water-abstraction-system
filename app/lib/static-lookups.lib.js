'use strict'

const billRunTypes = [
  'annual',
  'supplementary',
  'two_part_tariff'
]

const companyTypes = [
  'person',
  'organisation'
]

const contactTypes = [
  'person',
  'department'
]

const organisationTypes = [
  'individual',
  'limitedCompany',
  'limitedLiabilityPartnership',
  'publicLimitedCompany'
]

const sources = [
  'nald',
  'wrls'
]

module.exports = {
  billRunTypes,
  companyTypes,
  contactTypes,
  organisationTypes,
  sources
}
