// File: src/middlewares/validate.js
// What this does: Middleware factory that takes a Zod schema, validates and sanitizes incoming request bodies
// before they hit route controllers or Mongoose schemas, throwing formatted errors on invalid inputs.
// Used by: Protected or input-receiving routes in auth.routes.js, project.routes.js, and task.routes.js.

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400);
    const errorMessages = result.error.errors.map(e => e.message).join(', ');
    return next(new Error(errorMessages));
  }
  req.body = result.data;
  next();
};

export default validate;
