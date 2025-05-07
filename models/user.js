import database from "@/infra/database";
import { ValidationError, NotFoundError } from "@/infra/errors";

async function create(userInputValues) {
  const { username, email } = userInputValues;

  await validateUniqueUsername(username);
  await validateUniqueEmail(email);

  const newUser = await runInsertQuery(userInputValues);

  return newUser;
}

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
      action: "Please use a different username.",
    });
  }
}

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
      message: "Email already exists.",
      action: "Please use a different email.",
    });
  }
}

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

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;
}

async function runSelectQuery(username) {
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

const user = { create, findOneByUsername };

export default user;
