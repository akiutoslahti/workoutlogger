import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Workout from './Workout'

const WorkoutContainer = ({ workout }) => {
  return <Workout workout={workout} />
}

WorkoutContainer.propTypes = {}

const mapStateToProps = () => {}

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkoutContainer)
