export default function errorHandler(error, req, res, next) {
  console.log(error);
  if (error.name === "ValidationError") {
    const customError = {};
    for (const key in error.errors) {
      customError[key] = error.errors[key].message;
    }
    return res.status(422).send({ errors: customError });
  } else if (error.code === 11000) {
    const identifier = Object.keys(error.keyValue)[0];
    return res
      .status(409)
      .json({
        errors: {
          [identifier]: `That ${identifier} already exists. Please try another one.`,
        },
      });
  } else if (error.name === "CastError") {
    return res.status(400).json({
      message: "The ID you provided is Invalid",
    });
  } else {
    // Add a default error handler for unhandled errors
    return res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "production" ? {} : error,
    });
  }
}
