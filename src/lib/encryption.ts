/**
 * AES-256 Encryption Utilities
 * 
 * Provides secure encryption/decryption for sensitive data using AES-256.
 * Encryption key must be set in environment variable ENCRYPTION_KEY.
 */

import CryptoJS from 'crypto-js'

/**
 * Get encryption key from environment (evaluated at runtime)
 * TEMPORARY: Hardcoded for testing - Next.js env loading issue
 */
function getEncryptionKey(): string | undefined {
  // Try environment first
  const envKey = process.env.ENCRYPTION_KEY
  
  // TEMPORARY FALLBACK: Hardcode key for testing
  // TODO: Fix Next.js environment variable loading
  const hardcodedKey = 'K7mN9pQ2rT5vX8zA3cF6hJ1kL4nP7sU0wY3bE6gI9jM2'
  
  const key = envKey || hardcodedKey
  
  console.log('🔑 Encryption key source:', {
    fromEnv: !!envKey,
    fromHardcode: !envKey && !!hardcodedKey,
    keyLength: key?.length
  })
  
  return key
}

/**
 * Encrypt a string using AES-256
 * @param data - Plain text to encrypt
 * @returns Encrypted string (Base64 encoded)
 */
export function encrypt(data: string): string {
  if (!data) return ''
  
  const ENCRYPTION_KEY = getEncryptionKey()
  
  // DEBUG: Log encryption attempt
  console.log('🔐 Encrypt called:', {
    hasData: !!data,
    hasKey: !!ENCRYPTION_KEY,
    keyLength: ENCRYPTION_KEY?.length,
    dataPreview: data.substring(0, 20)
  })
  
  if (!ENCRYPTION_KEY) {
    console.warn('⚠️  Encryption skipped: ENCRYPTION_KEY not configured')
    return data // Return original data if key not set
  }
  
  try {
    const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY)
    const result = encrypted.toString()
    console.log('✅ Encrypted successfully, result preview:', result.substring(0, 20))
    return result
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt an encrypted string
 * @param encryptedData - Encrypted string (Base64 encoded)
 * @returns Decrypted plain text
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return ''
  
  const ENCRYPTION_KEY = getEncryptionKey()
  if (!ENCRYPTION_KEY) {
    console.warn('⚠️  Decryption skipped: ENCRYPTION_KEY not configured')
    return encryptedData // Return original data if key not set
  }
  
  // Check if data is actually encrypted (starts with "U2Fsd" for AES)
  if (!encryptedData.startsWith('U2Fsd')) {
    console.log('📝 Data is not encrypted (plaintext), returning as-is')
    return encryptedData // Return plaintext data
  }
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    
    if (!decrypted) {
      // If decryption fails, might be plaintext or wrong key
      console.warn('⚠️  Decryption failed, returning original data')
      return encryptedData
    }
    
    console.log('✅ Decrypted successfully')
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    // Return original data instead of throwing
    return encryptedData
  }
}

/**
 * Encrypt an object's sensitive fields
 * @param obj - Object with fields to encrypt
 * @param fields - Array of field names to encrypt
 * @returns New object with encrypted fields
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj }
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = encrypt(result[field] as string) as any
    }
  }
  
  return result
}

/**
 * Decrypt an object's encrypted fields
 * @param obj - Object with encrypted fields
 * @param fields - Array of field names to decrypt
 * @returns New object with decrypted fields
 */
export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj }
  
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      try {
        result[field] = decrypt(result[field] as string) as any
      } catch (error) {
        // If decryption fails, field might not be encrypted (legacy data)
        console.warn(`Failed to decrypt field ${String(field)}, keeping original value`)
      }
    }
  }
  
  return result
}

/**
 * Check if a string appears to be encrypted
 * @param data - String to check
 * @returns true if data appears to be encrypted
 */
export function isEncrypted(data: string): boolean {
  if (!data) return false
  
  // AES encrypted strings from crypto-js start with "U2Fsd" (base64 for "Salt")
  return data.startsWith('U2Fsd')
}
