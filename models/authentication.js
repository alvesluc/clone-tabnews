import { NotFoundError, UnauthorizedError } from "@/infra/errors";
import password from "@/models/password";
import user from "@/models/user";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Invalid email or password.",
        action:
          "Please check your credentials and try again. If the problem persists, consider resetting your password.",
      });
    }

    throw error;
  }
}

async function findUserByEmail(providedEmail) {
  let storedUser;

  try {
    storedUser = await user.findOneByEmail(providedEmail);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: "User not found with the provided email.",
        action: "Verify that the provided email is correct.",
      });
    }

    throw error;
  }

  return storedUser;
}

async function validatePassword(providedPassword, storedPassword) {
  const passwordMatches = await password.compare(
    providedPassword,
    storedPassword,
  );

  if (!passwordMatches) {
    throw new UnauthorizedError({
      message: "Password does not match stored hash.",
      action:
        "Verify that the provided password is correct and matches the stored credentials for the given email.",
    });
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
