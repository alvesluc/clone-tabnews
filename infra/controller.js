import { InternalServerError, MethodNotAllowedError } from "@/infra/errors";

function onNoMatchHandler(request, response) {
  const methodNotAllowed = new MethodNotAllowedError();
  response.status(methodNotAllowed.statusCode).json(methodNotAllowed);
}

function onErrorHandler(error, request, response) {
  const internalServerError = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });

  console.log("\n Error on /api/v1/status controller:");
  console.error(internalServerError);

  response.status(internalServerError.statusCode).json(internalServerError);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
