import controller from "@/infra/controller";
import authentication from "@/models/authentication";
import session from "@/models/session";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(postHandler);
router.delete(deleteHandler);

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

  controller.setSessionCookie(newSession.token, response);

  return response.status(201).json(newSession);
}

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(response);

  return response.status(200).json(expiredSession);
}

export default router.handler(controller.errorHandlers);
