import { connectToDatabase } from '../../utils/db'
import { getUserIdFromToken } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = await connectToDatabase()
  const users = db.collection('users')

  const userId = await getUserIdFromToken(event)
  if (!userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Check if the email already exists
  const existingUser = await users.findOne({ 
    $or: [
      { email: body.email },
      { additionalEmails: body.email }
    ]
  })

  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: 'Email already exists',
    })
  }

  const result = await users.updateOne(
    { _id: userId },
    { $addToSet: { additionalEmails: body.email } }
  )

  if (result.modifiedCount === 0) {
    throw createError({
      statusCode: 400,
      message: 'Failed to add email',
    })
  }

  return { success: true, message: `Email ${body.email} added successfully` }
})