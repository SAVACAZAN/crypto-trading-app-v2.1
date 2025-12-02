import { getCookie, getQuery } from 'h3'

/**
 * Get user ID from request cookies or headers
 * @param {*} event - H3 event object
 * @returns {string} - User ID
 */
export function getUserId(event) {
  // Try to get from cookie first
  const userIdFromCookie = getCookie(event, 'userID')
  if (userIdFromCookie) {
    return userIdFromCookie
  }

  // Try to get from headers
  const userIdFromHeader = event.node.req.headers['x-user-id']
  if (userIdFromHeader) {
    return userIdFromHeader
  }

  // Fallback: try to get from query params
  const query = getQuery(event)
  if (query && query.userId) {
    return query.userId
  }

  // Default fallback - use the actual user ID from your auth system
  return 'LCXuser'
}

/**
 * Get user ID from request body or fallback to getUserId
 * @param {*} event - H3 event object
 * @param {*} body - Request body
 * @returns {string} - User ID
 */
export function getUserIdFromBody(event, body) {
  if (body && body.userId) {
    return body.userId
  }
  return getUserId(event)
}
