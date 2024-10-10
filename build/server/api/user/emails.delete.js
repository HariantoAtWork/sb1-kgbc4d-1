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

  const user = await users.findOne({ _id: userId })
  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  if (!user.additionalEmails.includes(body.email)) {
    throw createError({
      statusCode: 400,
      message: 'Email not found in additional emails',
    })
  }

  const result = await users.updateOne(
    { _id: userId },
    { $pull: { additionalEmails: body.email } }
  )

  if (result.modifiedCount === 0) {
    throw createError({
      statusCode: 400,
      message: 'Failed to remove email',
    })
  }

  return { success: true, message: `Email ${body.email} removed successfully` }
})