const validator = require('validator')

const baseUrl = '/api/workoutsexercises'

const formatWorkoutExercise = (workoutExercise) => {
  const formattedWorkoutExercise = workoutExercise.toJSON()
  delete formattedWorkoutExercise.created_at
  delete formattedWorkoutExercise.updated_at
  return formattedWorkoutExercise
}

const workoutsExercisesRouter = (app, db) => {
  app.get(baseUrl, async (request, response) => {
    try {
      const allWorkoutsExercises = await db.workoutsExercises.findAll()
      const formattedWorkoutsExercises = allWorkoutsExercises.map(
        (workoutExercise) => formatWorkoutExercise(workoutExercise)
      )

      return response.json(formattedWorkoutsExercises)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl} failed because of error` })
    }
  })

  app.get(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      if (!validator.isUUID(id, 4)) {
        return response.status(400).json({
          error: `GET ${baseUrl}/${id} failed because id is not valid`
        })
      }

      const workoutExerciseById = await db.workoutsExercises.find({
        where: { id }
      })
      if (!workoutExerciseById) {
        return response.status(404).json({
          error: `GET ${baseUrl}/${id} failed because workoutExercise does not exist`
        })
      }

      return response
        .status(200)
        .json(formatWorkoutExercise(workoutExerciseById))
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl}/${id} failed because of error` })
    }
  })

  app.post(baseUrl, async (request, response) => {
    try {
      const {
        workout_id,
        exercise_id,
        set_count,
        repetition_count,
        weight
      } = request.body

      const { token } = request
      if (!token) {
        return response.status(401).json({
          error: `POST ${baseUrl} failed because of insufficient priviledges`
        })
      }

      if (!workout_id || !validator.isUUID(workout_id, 4)) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because workout_id is invalid`
        })
      }

      if (!exercise_id || !validator.isUUID(exercise_id, 4)) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because exercise_id is invalid`
        })
      }

      if (!set_count || set_count < 1) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because set_count is not positive`
        })
      }

      if (!repetition_count || repetition_count < 1) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because repetition_count is not positive`
        })
      }

      if (!weight || weight < 1) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because weight is not positive`
        })
      }

      const workoutById = await db.workouts.find({ where: { id: workout_id } })
      if (!workoutById) {
        return response.status(404).json({
          error: `POST ${baseUrl} failed because workout does not exist`
        })
      }

      if (workoutById.user_id !== token.id) {
        return response.status(401).json({
          error: `POST ${baseUrl} failed because of insufficient priviledges`
        })
      }

      const exerciseById = await db.exercises.find({
        where: { id: exercise_id }
      })
      if (!exerciseById) {
        return response.status(404).json({
          error: `POST ${baseUrl} failed because exercise does not exist`
        })
      }

      const newWorkoutExercise = {
        workout_id,
        exercise_id,
        set_count,
        repetition_count,
        weight
      }

      const createdWorkoutExercise = await db.workoutsExercises.create(
        newWorkoutExercise
      )
      return response
        .status(201)
        .json(formatWorkoutExercise(createdWorkoutExercise))
    } catch (error) {
      return response
        .status(500)
        .json({ error: `POST ${baseUrl} failed because of error` })
    }
  })

  app.delete(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      const { token } = request
      if (!token) {
        return response.status(401).json({
          error: `POST ${baseUrl} failed because of insufficient priviledges`
        })
      }

      if (!validator.isUUID(id, 4)) {
        return response.status(400).json({
          error: `DELETE ${baseUrl}/${id} failed because id is not valid`
        })
      }

      const workoutExerciseById = await db.workoutsExercises.find({
        where: { id }
      })
      if (!workoutExerciseById) {
        return response.status(404).json({
          error: `DELETE ${baseUrl}/${id} failed because workoutExercise does not exist`
        })
      }

      const workoutById = await db.workouts.find({
        where: { id: workoutExerciseById.workout_id }
      })
      if (workoutById.user_id !== token.id) {
        return response.status(401).json({
          error: `DELETE ${baseUrl}/${id} failed because if insufficient priviledges`
        })
      }

      await db.workoutsExercises.destroy({ where: { id } })
      return response.status(204).send()
    } catch (error) {
      return response
        .status(500)
        .json({ error: `DELETE ${baseUrl}/${id} failed because of error` })
    }
  })

  app.patch(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      const { token } = request
      if (!token) {
        return response.status(401).json({
          error: `PATCH ${baseUrl}/${id} failed because of insufficient priviledges`
        })
      }

      if (!validator.isUUID(id, 4)) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because id is not valid`
        })
      }

      const workoutExerciseById = await db.workoutsExercises.find({
        where: { id }
      })
      if (!workoutExerciseById) {
        return response.status(404).json({
          error: `PATCH ${baseUrl}/${id} failed because workoutExercise does not exist`
        })
      }

      const workoutById = await db.workouts.find({
        where: { id: workoutExerciseById.workout_id }
      })
      if (workoutById.user_id !== token.id) {
        return response.status(401).json({
          error: `PATCH ${baseUrl}/${id} failed because if insufficient priviledges`
        })
      }

      const { updates } = request.body

      if (!updates) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because no updates were provided with request`
        })
      }

      if (updates.workout_id || updates.exercise_id || updates.id) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because updating id and/or workout_id and/or exercise_id is not allowed`
        })
      }

      if (updates.set_count && updates.set_count < 1) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because repetition_count is not positive integer`
        })
      }

      if (updates.repetition_count && updates.repetition_count < 1) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because repetition_count is not positive integer`
        })
      }

      if (updates.weight && updates.weight < 1) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because repetition_count is not positive integer`
        })
      }

      const updatedWorkoutExercise = await workoutExerciseById.updateAttributes(
        updates
      )
      return response
        .status(200)
        .json(formatWorkoutExercise(updatedWorkoutExercise))
    } catch (error) {
      return response
        .status(500)
        .json({ error: `PATCH ${baseUrl}/${id} failed because of error` })
    }
  })
}

module.exports = workoutsExercisesRouter
