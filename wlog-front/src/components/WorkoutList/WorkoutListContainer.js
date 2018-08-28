import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import WorkoutList from './WorkoutList'

const WorkoutListContainer = ({ workouts }) => {
  return <WorkoutList workouts={workouts} />
}

WorkoutListContainer.propTypes = {}

const mapStateToProps = () => {}

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkoutListContainer)
