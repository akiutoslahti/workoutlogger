const validator = require('validator')

const baseUrl = '/api/exercises'

const formatExercise = (exercise) => {
  const formattedExercise = exercise.toJSON()
  delete formattedExercise.created_at
  delete formattedExercise.updated_at
  return formattedExercise
}

const exercisesRouter = (app, db) => {
  app.get(baseUrl, async (request, response) => {
    try {
      const allExercises = await db.exercises.findAll()
      const formattedExercises = allExercises.map((exercise) =>
        formatExercise(exercise)
      )

      return response.json(formattedExercises)
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

      const exerciseById = await db.exercises.find({ where: { id } })
      if (!exerciseById) {
        return response.status(404).json({
          error: `GET ${baseUrl}/${id} failed because exercise does not exist`
        })
      }

      return response.status(200).json(formatExercise(exerciseById))
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl}/${id} failed because of error` })
    }
  })

  app.post(baseUrl, async (request, response) => {
    try {
      const { name, description } = request.body
      if (!name) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because empty name is not allowed`
        })
      }

      const exerciseExists = await db.exercises.find({ where: { name } })
      if (exerciseExists) {
        return response.status(409).json({
          error: `POST ${baseUrl} failed because duplicate exercises are not allowed`
        })
      }

      const newExercise = {
        name,
        description: description || ''
      }

      const createdExercise = await db.exercises.create(newExercise)
      return response.status(201).json(formatExercise(createdExercise))
    } catch (error) {
      return response
        .status(500)
        .json({ error: `POST ${baseUrl} failed because of error` })
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

      const exerciseById = await db.exercises.find({ where: { id } })
      if (!exerciseById) {
        return response.status(404).json({
          error: `DELETE ${baseUrl}/${id} failed because exercise does not exist`
        })
      }

      const exerciseInUse = await db.workoutsExercises.find({
        where: { exercise_id: id }
      })
      if (exerciseInUse) {
        return response.status(400).json({
          error: `DELETE ${baseUrl}/${id} failed because exercise is used in workouts`
        })
      }

      await db.exercises.destroy({ where: { id } })
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
      if (!validator.isUUID(id, 4)) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because id is not valid`
        })
      }

      const exerciseById = await db.exercises.find({ where: { id } })
      if (!exerciseById) {
        return response.status(404).json({
          error: `PATCH ${baseUrl}/${id} failed because exercise does not exist`
        })
      }

      const { updates } = request.body
      if (!updates) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because no updates were provided in request`
        })
      }

      if (updates.id || updates.name) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because id and/or name cannot be patched`
        })
      }

      const updatedExercise = await exerciseById.updateAttributes(updates)
      return response.status(200).json(formatExercise(updatedExercise))
    } catch (error) {
      return response
        .status(500)
        .json({ error: `PATCH ${baseUrl}/${id} failed because of error` })
    }
  })
}

module.exports = exercisesRouter
