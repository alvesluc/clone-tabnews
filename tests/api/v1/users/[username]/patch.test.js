import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import user from "@/models/user";
import password from "@/models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runMigrations();
});

describe("PATCH /api/v1/users/alvesluc", () => {
  describe("Anonymous user", () => {
    test("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistentuser",
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "User not found.",
        action: "Please check the username and try again.",
        status_code: 404,
      });
    });

    test("With unique 'username'", async () => {
      await orchestrator.createUser({
        username: "valid_unique_username",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/valid_unique_username",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "different_unique_username",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "different_unique_username",
        email: responseBody.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "unique_username",
      });

      await orchestrator.createUser({
        username: "non_unique_username",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/non_unique_username",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "unique_username",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        status_code: 400,
        message: "Username already in use.",
        action: "Please choose a different username.",
      });
    });

    test("With same 'username'", async () => {
      await orchestrator.createUser({ username: "same_username" });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/same_username",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "same_username",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        status_code: 400,
        message: "Username already in use.",
        action: "Please choose a different username.",
      });
    });

    test("With unique 'email'", async () => {
      const uniqueEmailUser = await orchestrator.createUser({
        email: "unique_email@user.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${uniqueEmailUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "different_unique_email@user.com",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: responseBody.username,
        email: "different_unique_email@user.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "unique_email@user.com",
      });

      const nonUniqueEmailUser = await orchestrator.createUser({
        email: "non_unique_email@user.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${nonUniqueEmailUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "unique_email@user.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        status_code: 400,
        message: "Email already in use.",
        action: "Please choose a different email.",
      });
    });

    test("With same 'email'", async () => {
      const sameEmailUser = await orchestrator.createUser({
        email: "same_email@user.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${sameEmailUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "same_email@user.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        status_code: 400,
        message: "Email already in use.",
        action: "Please choose a different email.",
      });
    });

    test("With new 'password'", async () => {
      const updatePasswordUser = await orchestrator.createUser({
        password: "password123",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${updatePasswordUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "password321",
          }),
        },
      );

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(
        updatePasswordUser.username,
      );

      const correctPasswordMatches = await password.compare(
        "password321",
        userInDatabase.password,
      );

      expect(correctPasswordMatches).toBe(true);

      const incorrectPasswordMatches = await password.compare(
        "password123",
        userInDatabase.password,
      );

      expect(incorrectPasswordMatches).toBe(false);
    });
  });
});
