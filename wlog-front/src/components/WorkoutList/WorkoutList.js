import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Table } from 'semantic-ui-react'

const WorkoutList = ({ workouts }) => {
  return (
    <div>
      <h2>workouts</h2>
      <Table striped>
        <Table.Body>
          {workouts.sort((a, b) => b.date - a.date).map((workout) => (
            <Table.Row key={workout.id}>
              <Table.Cell>
                <Link to={`/workouts/${workout.id}`}>{workout.date}</Link>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}

WorkoutList.propTypes = {}

export default WorkoutList
