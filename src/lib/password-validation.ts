/**
 * Password Validation Utilities
 * 
 * Provides password strength validation and policy enforcement.
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

/**
 * Validate password strength and policy compliance
 * @param password - Password to validate
 * @returns Validation result with errors and strength rating
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  
  // Minimum length
  const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '8')
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`)
  }
  
  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  // Number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  
  if (errors.length === 0) {
    // Check for special characters
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const isLong = password.length >= 12
    
    if (hasSpecialChar && isLong) {
      strength = 'strong'
    } else if (hasSpecialChar || isLong) {
      strength = 'medium'
    } else {
      strength = 'medium'
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  }
}

/**
 * Generate a secure random password
 * @param length - Password length (default: 12)
 * @returns Random password meeting all requirements
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*'
  
  const allChars = uppercase + lowercase + numbers + special
  
  // Ensure at least one of each type
  let password = ''
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Get password strength color for UI
 * @param strength - Password strength rating
 * @returns Tailwind color class
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'text-red-500'
    case 'medium':
      return 'text-yellow-500'
    case 'strong':
      return 'text-green-500'
  }
}

/**
 * Get password strength label for UI
 * @param strength - Password strength rating
 * @returns Human-readable label
 */
export function getPasswordStrengthLabel(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'Lemah'
    case 'medium':
      return 'Sedang'
    case 'strong':
      return 'Kuat'
  }
}
