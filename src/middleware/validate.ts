import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateRequest = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: error.issues.map((err) => err.message),
        });
        return;
      }

      // Handle other types of errors
      if (error instanceof Error) {
        res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: [error.message],
        });
        return;
      }

      // Unknown error type
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  };
};
