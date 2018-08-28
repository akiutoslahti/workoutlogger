import React from 'react'
import PropTypes from 'prop-types'

const Workout = ({ workout }) => {
  return (
    <div>
      <h2>{workout.date}</h2>
    </div>
  )
}

Workout.propTypes = {}

export default Workout
