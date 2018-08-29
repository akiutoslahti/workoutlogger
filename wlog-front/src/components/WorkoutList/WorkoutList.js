import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Table } from 'semantic-ui-react'

const WorkoutList = ({ workouts }) => (
  <div>
    <h2>workouts</h2>
    <Table striped>
      <Table.Body>
        {workouts.sort((a, b) => a.date < b.date).map((workout) => (
          <Table.Row key={workout.id}>
            <Table.Cell>
              <Link to={`/workouts/${workout.id}`}>
                {workout.date.substring(0, 21)}
              </Link>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </div>
)

WorkoutList.propTypes = {
  workouts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      user_id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired
    }).isRequired
  ).isRequired
}

export default WorkoutList
