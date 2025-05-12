import bcryptjs from "bcryptjs";

/**
 * Hashes a plaintext password using bcrypt.
 *
 * @async
 * @function
 * @param {string} password - The plaintext password to hash.
 * @returns {Promise<string>} The resulting hashed password.
 */
async function hash(password) {
  const rounds = getNumberOfRounds();
  return await bcryptjs.hash(password, rounds);
}

/**
 * Determines the number of salt rounds to use for hashing.
 * Uses more rounds in production for better security.
 *
 * @function
 * @returns {number} The number of salt rounds.
 */
function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

/**
 * Compares a plaintext password with a hashed password to check for a match.
 *
 * @async
 * @function
 * @param {string} password - The plaintext password to compare.
 * @param {string} hash - The hashed password to compare against.
 * @returns {Promise<boolean>} True if the password matches the hash, false otherwise.
 */
async function compare(password, hash) {
  return await bcryptjs.compare(password, hash);
}

/**
 * Password utility object containing hashing and comparison functions.
 *
 * @property {Function} hash - Hashes a password.
 * @property {Function} compare - Compares a password with a hash.
 */
const password = { hash, compare };

export default password;
