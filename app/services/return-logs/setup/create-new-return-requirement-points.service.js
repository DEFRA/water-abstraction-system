'use strict'

/**
 * Creates new return requirement points based on the existing return requirements
 * @module CreateNewReturnRequirementPointsService
 */

const ReturnRequirementPointModel = require('../../../models/return-requirement-point.model.js')

/**
 * TODO: Document
 *
 * @param currentReturnRequirements
 * @param newReturnRequirements
 * @returns
 */
async function go(currentReturnRequirements, newReturnRequirements) {
  const currentReturnRequirementIds = currentReturnRequirements.map((returnRequirement) => returnRequirement.id)

  const currentReturnRequirementPoints = await ReturnRequirementPointModel.query().whereIn(
    'returnRequirementId',
    currentReturnRequirementIds
  )

  // When we clone the existing return requirement points, we need to do the following:
  // - Replace the existing return requirement id with the new one
  // - Generate a new external id by taking the existing one and replacing the legacy id in the middle of it with the
  //   new one
  // - Keep the existing point id
  //
  // To help us do this, we create a hash map of the existing return requirements (mapping id to the requirement) and
  // another mapping the existing return requiremend id to the new one
  const currentReturnRequirementsMap = new Map()
  const currentToNewReturnRequirementsMap = new Map()
  currentReturnRequirements.forEach((returnRequirement, index) => {
    currentReturnRequirementsMap.set(returnRequirement.id, returnRequirement)
    currentToNewReturnRequirementsMap.set(returnRequirement.id, newReturnRequirements[index])
  })

  const newPointsToInsert = currentReturnRequirementPoints.map((currentPoint) => {
    const currentReturnRequirement = currentReturnRequirementsMap.get(currentPoint.returnRequirementId)
    const newReturnRequirement = currentToNewReturnRequirementsMap.get(currentPoint.returnRequirementId)

    return {
      pointId: currentPoint.pointId,
      returnRequirementId: newReturnRequirement.id,
      externalId: currentPoint.externalId.replace(
        `:${currentReturnRequirement.legacyId}:`,
        `:${newReturnRequirement.legacyId}:`
      )
    }
  })

  return ReturnRequirementPointModel.query().insert(newPointsToInsert)
}

module.exports = {
  go
}
