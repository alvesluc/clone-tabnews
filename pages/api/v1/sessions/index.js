import controller from "@/infra/controller";
import authentication from "@/models/authentication";
import session from "@/models/session";
import * as cookie from "cookie";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler);

/**
 * @param {import("next").NextApiRequest} request - The incoming HTTP request.
 * @param {import("next").NextApiResponse} response - The HTTP response object.
 */
async function postHandler(request, response) {
  const userInputValues = request.body;
  const { email, password } = userInputValues;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    email,
    password,
  );

  const newSession = await session.create(authenticatedUser.id);

  const setCookie = cookie.serialize("session_id", newSession.token, {
    path: "/",
    // expires: new Date(newSession.expires_at),
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);

  return response.status(201).json(newSession);
}

export default router.handler(controller.errorHandlers);

// fetch('/api/v1/sessions', {
//     method : "POST",
//     headers: {
//         "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//         email: "cookie@curso.dev",
//         password: "cookie"
//     })
// });
