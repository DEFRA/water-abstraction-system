'use strict'

/**
 * Returns a summer return cycle fixture with predefined dates and properties
 *
 * @returns {object} A summer return cycle object with id, dates, and flags
 */
function summerCycle() {
  return {
    id: '4c5ff4dc-dfe0-4693-9cb5-acdebf6f76b8',
    startDate: new Date('2025-11-01'),
    endDate: new Date('2026-10-31'),
    dueDate: new Date('2026-11-28'),
    summer: true,
    submittedInWrls: true
  }
}

/**
 * Returns a winter and all year return cycle fixture with predefined dates and properties
 *
 * @returns {object} A winter return cycle object with id, dates, and flags
 */
function winterCycle() {
  return {
    id: '6889b98d-964f-4966-b6d6-bf511d6526a9',
    startDate: new Date('2025-04-01'),
    endDate: new Date('2026-03-31'),
    dueDate: new Date('2026-04-28'),
    summer: false,
    submittedInWrls: true
  }
}

/**
 * Represents a list of return cycles from the database, as fetched in `ProcessLicenceReturnLogsService`
 *
 * @param {number} [numberOfCycles=2] - the number of return cycles to return - defaults to the first two
 * @returns {object[]} an array of objects, each representing a return cycle
 */
function returnCycles(numberOfCycles = 2) {
  const cycles = [
    summerCycle(),
    winterCycle(),
    {
      id: '4c5ff4dc-dfe0-4693-9cb5-acdebf6f76b4',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-10-31'),
      dueDate: new Date('2025-11-28'),
      summer: true,
      submittedInWrls: true
    },
    {
      id: '6889b98d-964f-4966-b6d6-bf511d6526a1',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      dueDate: new Date('2025-04-28'),
      summer: false,
      submittedInWrls: true
    },
    {
      id: '4c5ff4dc-dfe0-4693-9cb5-acdebf6f76b5',
      startDate: new Date('2023-11-01'),
      endDate: new Date('2024-10-31'),
      dueDate: new Date('2024-11-28'),
      summer: true,
      submittedInWrls: true
    },
    {
      id: '6889b98d-964f-4966-b6d6-bf511d6526a2',
      startDate: new Date('2023-04-01'),
      endDate: new Date('2024-03-31'),
      dueDate: new Date('2024-04-28'),
      summer: false,
      submittedInWrls: true
    }
  ]

  return cycles.slice(0, numberOfCycles)
}

module.exports = {
  returnCycles,
  summerCycle,
  winterCycle
}
