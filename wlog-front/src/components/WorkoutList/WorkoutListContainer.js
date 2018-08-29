import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import WorkoutList from './WorkoutList'

const WorkoutListContainer = ({ workouts }) => (
  <WorkoutList workouts={workouts} />
)

WorkoutListContainer.propTypes = {
  workouts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      user_id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired
    }).isRequired
  ).isRequired
}

const mapStateToProps = (state) => ({
  workouts: state.workouts
})

export default connect(mapStateToProps)(WorkoutListContainer)
