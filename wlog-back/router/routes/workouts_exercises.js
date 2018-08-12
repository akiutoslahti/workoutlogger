const validator = require('validator')

const baseUrl = '/api/workoutsexercises'

const workoutsExercisesRouter = (app, db) => {
  app.get(baseUrl, async (request, response) => {
    try {
      const allWorkoutsExercises = await db.workoutsExercises.findAll()
      return response.json(allWorkoutsExercises)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl} failed due error` })
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

      return response.status(200).json(workoutExerciseById)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl}/${id} failed due error` })
    }
  })

  app.post(baseUrl, async (request, response) => {
    try {
      const {
        workout_id,
        exercise_id,
        set_count,
        repetition_count
      } = request.body

      if (!validator.isUUID(workout_id, 4)) {
        return response.status(404).json({
          error: `POST ${baseUrl} failed because workout_id is invalid`
        })
      }

      if (!validator.isUUID(exercise_id, 4)) {
        return response.status(404).json({
          error: `POST ${baseUrl} failed because exercise_id is invalid`
        })
      }

      const workoutById = await db.workouts.find({ where: { id: workout_id } })
      if (!workoutById) {
        return response.status(404).json({
          error: `POST ${baseUrl} failed because workout does not exist`
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

      if (set_count < 1 || repetition_count < 1) {
        return response.status(404).json({
          error: `POST ${baseUrl} failed because set_count and/or rep_count is non positive integer`
        })
      }

      const newWorkoutExercise = {
        workout_id,
        exercise_id,
        set_count,
        repetition_count
      }

      const createdWorkoutExercise = db.workoutsExercises.create(
        newWorkoutExercise
      )
      return response.status(201).json(createdWorkoutExercise)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `POST ${baseUrl} failed due error` })
    }
  })

  app.delete(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
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

      await db.workoutsExercises.destroy({ where: { id } })
      return response.status(200).send()
    } catch (error) {
      return response
        .status(500)
        .json({ error: `DELETE ${baseUrl}/${id} failed due error` })
    }
  })

  // Only set_count and repetition_count can be updated
  app.patch(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
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

      const { updates } = request.body
      if (updates.workout_id || updates.exercise_id) {
        return response.status(404).json({
          error: `PATCH ${baseUrl}/${id} failed because updating workout_id and/or exercise_id is not allowed`
        })
      }

      if (!validator.isInt(updates.set_count) || updates.set_count < 1) {
        return response.status(404).json({
          error: `PATCH ${baseUrl}/${id} failed because set_count is not positive integer`
        })
      }

      if (
        !validator.isInt(updates.repetition_count) ||
        updates.repetition_count < 1
      ) {
        return response.status(404).json({
          error: `PATCH ${baseUrl}/${id} failed because repetition_count is not positive integer`
        })
      }

      const updatedWorkoutExercise = await workoutExerciseById.updateAttributes(
        updates
      )
      return response.status(200).json(updatedWorkoutExercise)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `PATCH ${baseUrl}/${id} failed due error` })
    }
  })
}

module.exports = workoutsExercisesRouter
