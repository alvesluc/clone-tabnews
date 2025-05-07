import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
} from "@/infra/errors";

function onNoMatchHandler(request, response) {
  const methodNotAllowed = new MethodNotAllowedError();
  response.status(methodNotAllowed.statusCode).json(methodNotAllowed);
}

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return response.status(error.statusCode).json(error);
  }

  const internalServerError = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });

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
