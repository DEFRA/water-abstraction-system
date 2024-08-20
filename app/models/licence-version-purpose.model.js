'use strict'

/**
 * Model for licence_version_purposes (water.licence_version_purposes)
 * @module LicenceVersionPurposeModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceVersionPurposeModel extends BaseModel {
  static get tableName () {
    return 'licenceVersionPurposes'
  }

  static get relationMappings () {
    return {
      licenceVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-version.model',
        join: {
          from: 'licenceVersionPurposes.licenceVersionId',
          to: 'licenceVersions.id'
        }
      },
      licenceVersionPurposeConditions: {
        relation: Model.HasManyRelation,
        modelClass: 'licence-version-purpose-condition.model',
        join: {
          from: 'licenceVersionPurposes.id',
          to: 'licenceVersionPurposeConditions.licenceVersionPurposeId'
        }
      },
      primaryPurpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'primary-purpose.model.js',
        join: {
          from: 'licenceVersionPurposes.primaryPurposeId',
          to: 'primaryPurposes.id'
        }
      },
      purpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'purpose.model.js',
        join: {
          from: 'licenceVersionPurposes.purposeId',
          to: 'purposes.id'
        }
      },
      secondaryPurpose: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'secondary-purpose.model.js',
        join: {
          from: 'licenceVersionPurposes.secondaryPurposeId',
          to: 'secondaryPurposes.id'
        }
      }
    }
  }

  /**
   * Modifiers allow us to reuse logic in queries, eg. select the licence version purpose and all related purposes to
   * determine if the purpose is electricity generation.
   *
   * @example
   * return LicenceVersionPurposeModel.query()
   *   .findById(licenceVersionPurposeId)
   *   .modify('allPurposes')
   *
   * See {@link https://vincit.github.io/objection.js/recipes/modifiers.html | Modifiers} for more details
   */
  static get modifiers () {
    return {

      /**
       * allPurposes modifier fetches the purpose plus primary and secondary purposes. Built to support determining if
       * the overall purpose is electricity generation or spray irrigation with two-part tariff. These are needed to
       * determine what frequency returns should be collected and reported by the licensee.
       * @param query
       */
      allPurposes (query) {
        query
          .withGraphFetched('purpose')
          .modifyGraph('purpose', (builder) => {
            builder.select([
              'id',
              'description',
              'legacyId',
              'twoPartTariff'
            ])
          })
          .withGraphFetched('primaryPurpose')
          .modifyGraph('primaryPurpose', (builder) => {
            builder.select([
              'id',
              'legacyId'
            ])
          })
          .withGraphFetched('secondaryPurpose')
          .modifyGraph('secondaryPurpose', (builder) => {
            builder.select([
              'id',
              'legacyId'
            ])
          })
      }
    }
  }

  /**
   * Determine if the overall purpose is for electricity generation
   *
   * If the primary purpose is P (Production Of Energy), the secondary purpose is ELC (Electricity) and purpose is
   * either 200 (Heat Pump) or 240 (Hydroelectric Power Generation) then the overall purpose is deemed to be electricity
   * generation.
   *
   * This information is used when we have to generate return requirements from the current abstraction data and
   * determine what collection and reporting frequency to use.
   *
   * @returns {boolean} true if the overall purpose is electricity generation (P-ELC-240 or P-ELC-200) else false
   */
  $electricityGeneration () {
    if (this.primaryPurpose.legacyId !== 'P') {
      return false
    }

    if (this.secondaryPurpose.legacyId !== 'ELC') {
      return false
    }

    const electricityGenerationPurposes = ['200', '240']

    return electricityGenerationPurposes.includes(this.purpose.legacyId)
  }
}

module.exports = LicenceVersionPurposeModel
