/**
 * Role Utilities for PostgreSQL Json type compatibility
 * Handles both String (SQLite legacy) and Json (PostgreSQL) types
 */

/**
 * Parse roles from database
 * Handles both String (old SQLite) and Json (new PostgreSQL) formats
 */
export function parseRoles(roles: any): string[] {
  if (!roles) return []
  
  // If already an array (PostgreSQL Json type)
  if (Array.isArray(roles)) {
    return roles
  }
  
  // If string (SQLite legacy or stringified)
  if (typeof roles === 'string') {
    try {
      const parsed = JSON.parse(roles)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  
  return []
}

/**
 * Prepare roles for database storage
 * PostgreSQL Json type - just return array
 */
export function prepareRoles(roles: string[]): string[] {
  return roles
}

/**
 * Check if user has specific role
 */
export function hasRole(user: any, role: string): boolean {
  const roles = parseRoles(user.roles)
  return roles.includes(role)
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: any, allowedRoles: string[]): boolean {
  const roles = parseRoles(user.roles)
  return roles.some(role => allowedRoles.includes(role))
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(user: any, requiredRoles: string[]): boolean {
  const roles = parseRoles(user.roles)
  return requiredRoles.every(role => roles.includes(role))
}

