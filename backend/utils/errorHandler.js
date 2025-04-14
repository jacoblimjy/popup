const logger = console;

/**
 * Standard error response format
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle errors in controllers
 * @param {Function} fn - Controller function to wrap
 * @returns {Function} - Wrapped function with error handling
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    handleError(error, req, res);
  });
};

/**
 * Process errors and send appropriate response
 * @param {Error} error - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const handleError = (error, req, res) => {
  // Log all errors
  logger.error(`Error: ${error.message}`);
  logger.error(`Stack: ${error.stack}`);

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  if (
    error.message === "Question not found" ||
    error.message === "Child not found" ||
    error.message === "Pending Question not found" ||
    error.message === "Attempted set not found" ||
    error.message === "Attempted question not found" ||
    error.message === "Performance record not found"
  ) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(400).json({
      success: false,
      message: "A record with this information already exists",
      details: error.sqlMessage,
    });
  }

  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};

module.exports = {
  ApiError,
  asyncHandler,
  handleError,
};
