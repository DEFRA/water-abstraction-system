'use strict'

/**
 * @module BasePointModel
 */

const BaseModel = require('./base.model.js')

/**
 * Base class for all 'point' based models, for example, `ReturnRequirementPointModel`
 */
class BasePointModel extends BaseModel {
  /**
   * Generate a string that describes this abstraction point
   *
   * When abstracting water the point at which this is done can be described in several ways depending on the number of
   * Nation Grid References saved against the abstraction point.
   *
   * - 'point' - A single point grid reference
   * - 'reach' - Two grid references defining a 'reach' or line along which water will be abstracted
   * - 'area' - Four grid references defining the area water will be abstracted
   *
   * Finally, when the point is added to the system the user can add a supplementary description. If this exists the
   * description returned combines the point description and the supplementary one.
   *
   * @returns {string} the description of this abstraction point
   */
  $describe () {
    let abstractionPoint

    // If ng4 is populated then we know this point is an 'area'
    if (this.ngr4) {
      abstractionPoint = `Within the area formed by the straight lines running between National Grid References ${this.ngr1} ${this.ngr2} ${this.ngr3} and ${this.ngr4}`
    } else if (this.ngr2) {
      // If ng2 is populated then we know this point is a 'reach'
      abstractionPoint = `Between National Grid References ${this.ngr1} and ${this.ngr2}`
    } else {
      // Else this point must be ... a point!
      abstractionPoint = `At National Grid Reference ${this.ngr1}`
    }

    abstractionPoint = this.description ? `${abstractionPoint} (${this.description})` : abstractionPoint

    return abstractionPoint
  }
}

module.exports = BasePointModel
