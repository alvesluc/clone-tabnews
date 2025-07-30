import database from "@/infra/database";
import password from "@/models/password";
import { ValidationError, NotFoundError } from "@/infra/errors";

/**
 * Creates a new user after validating uniqueness and hashing the password.
 *
 * @async
 * @param {Object} userInputValues - The input values for the new user.
 * @param {string} userInputValues.username - The username of the new user.
 * @param {string} userInputValues.email - The email of the new user.
 * @param {string} userInputValues.password - The plain text password of the new user.
 * @returns {Promise<Object>} The newly created user object.
 * @throws {ValidationError} If the username or email is already in use.
 */
async function create(userInputValues) {
  const { username, email } = userInputValues;

  await validateUniqueUsername(username);
  await validateUniqueEmail(email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);

  return newUser;
}

/**
 * Validates that the provided username is not already in use.
 *
 * @async
 * @param {string} username - The username to validate.
 * @throws {ValidationError} If the username is already in use.
 */
async function validateUniqueUsername(username) {
  const results = await database.query({
    text: `
    SELECT username FROM users
    WHERE LOWER(username) = LOWER($1)
    ;`,
    values: [username],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "Username already in use.",
      action: "Please choose a different username.",
    });
  }
}

/**
 * Validates that the provided email is not already registered.
 *
 * @async
 * @param {string} email - The email to validate.
 * @throws {ValidationError} If the email is already in use.
 */
async function validateUniqueEmail(email) {
  const results = await database.query({
    text: `
    SELECT email FROM users
    WHERE LOWER(email) = LOWER($1)
    ;`,
    values: [email],
  });

  if (results.rowCount > 0) {
    throw new ValidationError({
      message: "Email already in use.",
      action: "Please choose a different email.",
    });
  }
}

/**
 * Hashes the user's password and updates the input object.
 *
 * @async
 * @param {Object} userInputValues - The user input object containing a password.
 * @param {string} userInputValues.password - The plain text password to hash.
 * @returns {Promise<string>} The hashed password.
 */
async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);

  return (userInputValues.password = hashedPassword);
}

/**
 * Inserts a new user into the database.
 *
 * @async
 * @param {Object} userInputValues - The user data to insert.
 * @param {string} userInputValues.username - The username of the user.
 * @param {string} userInputValues.email - The email of the user.
 * @param {string} userInputValues.password - The hashed password of the user.
 * @returns {Promise<Object>} The newly inserted user record.
 */
async function runInsertQuery(userInputValues) {
  const { username, email, password } = userInputValues;

  const results = await database.query({
    text: `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING *
    ;`,
    values: [username, email, password],
  });

  return results.rows[0];
}

/**
 * Finds a user by username.
 *
 * @async
 * @param {string} username - The username to search for.
 * @returns {Promise<Object>} The user object if found.
 * @throws {NotFoundError} If the user is not found.
 */
async function findOneByUsername(username) {
  const userFound = await runSelectUsernameQuery(username);

  return userFound;
}

/**
 * Executes a query to find a user by username.
 *
 * @async
 * @param {string} username - The username to search for.
 * @returns {Promise<Object>} The user object if found.
 * @throws {NotFoundError} If no user is found.
 */
async function runSelectUsernameQuery(username) {
  const results = await database.query({
    text: `
    SELECT * FROM users
    WHERE LOWER(username) = LOWER($1)
    LIMIT 1
    ;`,
    values: [username],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "User not found.",
      action: "Please check the username and try again.",
    });
  }

  return results.rows[0];
}

/**
 * Finds a user by email.
 *
 * @async
 * @param {string} email - The email to search for.
 * @returns {Promise<Object>} The user object if found.
 * @throws {NotFoundError} If the user is not found.
 */
async function findOneByEmail(email) {
  const userFound = await runSelectEmailQuery(email);

  return userFound;
}

/**
 * Executes a query to find a user by email.
 *
 * @async
 * @param {string} email - The email to search for.
 * @returns {Promise<Object>} The user object if found.
 * @throws {NotFoundError} If no user is found.
 */
async function runSelectEmailQuery(email) {
  const results = await database.query({
    text: `
    SELECT * FROM users
    WHERE LOWER(email) = LOWER($1)
    LIMIT 1
    ;`,
    values: [email],
  });

  if (results.rowCount === 0) {
    throw new NotFoundError({
      message: "User not found.",
      action: "Please check the email and try again.",
    });
  }

  return results.rows[0];
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if (isUpdatingUsername(currentUser.username, userInputValues)) {
    await validateUniqueUsername(userInputValues.username);
  }

  if (isUpdatingEmail(currentUser.email, userInputValues)) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };
  const updatedUser = await runUpdateQuery(userWithNewValues);

  return updatedUser;
}

function isUpdatingUsername(currentUsername, userInputValues) {
  if (!("username" in userInputValues)) return false;

  const isUsernameChanged = userInputValues.username !== currentUsername;

  if (!isUsernameChanged) {
    throw new ValidationError({
      message: "Username already in use.",
      action: "Please choose a different username.",
    });
  }

  return true;
}

function isUpdatingEmail(currentEmail, userInputValues) {
  if (!("email" in userInputValues)) return false;

  const isEmailChanged = userInputValues.email !== currentEmail;

  if (!isEmailChanged) {
    throw new ValidationError({
      message: "Email already in use.",
      action: "Please choose a different email.",
    });
  }

  return true;
}

async function runUpdateQuery(userWithNewValues) {
  const { id, username, email, password } = userWithNewValues;

  const results = await database.query({
    text: `
    UPDATE users 
    SET 
      username = $2,
      email = $3,
      password = $4,
      updated_at = timezone('UTC', now())
    WHERE id = $1
    RETURNING *
    ;`,
    values: [id, username, email, password],
  });

  return results.rows[0];
}

/**
 * User service with methods for creating and finding users.
 *
 * @property {Function} create - Creates a new user.
 * @property {Function} findOneByUsername - Finds a user by username.
 * @property {Function} update - Updates user information.
 */
const user = { create, findOneByUsername, findOneByEmail, update };

export default user;
