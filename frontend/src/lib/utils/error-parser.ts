import { AxiosError } from "axios";
import { ApiError } from "../api/types";

/**
 * Validation error detail structure from the API
 */
interface ValidationErrorDetail {
  property: string;
  value?: unknown;
  constraints?: Record<string, string>;
  children?: ValidationErrorDetail[];
}

/**
 * Parsed error structure with field-level errors
 */
export interface ParsedError {
  fieldErrors: Record<string, string>;
  generalError?: string;
  errorCode?: string;
}

/**
 * Extracts the first constraint message from a validation error detail
 */
function extractConstraintMessage(
  constraints?: Record<string, string>
): string | undefined {
  if (!constraints || Object.keys(constraints).length === 0) {
    return undefined;
  }
  // Return the first constraint value as the error message
  return Object.values(constraints)[0];
}

/**
 * Recursively extracts validation errors from nested error details
 */
function extractValidationErrors(
  details: ValidationErrorDetail[],
  fieldErrors: Record<string, string> = {},
  parentPath = ""
): Record<string, string> {
  for (const detail of details) {
    const fieldPath = parentPath
      ? `${parentPath}.${detail.property}`
      : detail.property;

    // Extract constraint message if available
    const message = extractConstraintMessage(detail.constraints);
    if (message) {
      fieldErrors[fieldPath] = message;
    }

    // Recursively process children (for nested objects/arrays)
    if (detail.children && detail.children.length > 0) {
      extractValidationErrors(detail.children, fieldErrors, fieldPath);
    }
  }

  return fieldErrors;
}

/**
 * Parses an axios error response to extract validation errors and general errors
 */
export function parseApiError(error: unknown): ParsedError {
  const parsed: ParsedError = {
    fieldErrors: {},
  };

  // Check if it's an axios error
  if (!(error instanceof Error)) {
    parsed.generalError = "An unexpected error occurred";
    return parsed;
  }

  const axiosError = error as AxiosError<ApiError>;

  // Extract API error response
  const apiError = axiosError.response?.data;

  if (!apiError || !apiError.error) {
    parsed.generalError = error.message || "An unexpected error occurred";
    return parsed;
  }

  parsed.errorCode = apiError.error.code;

  // Handle ConflictException (409)
  if (apiError.error.code === "ConflictException") {
    parsed.generalError =
      apiError.error.message ||
      (apiError.error.details as { message?: string })?.message ||
      "A conflict occurred";
    return parsed;
  }

  // Handle BadRequestException with validation errors
  if (apiError.error.code === "BadRequestException") {
    const details = apiError.error.details as {
      error?: {
        code?: string;
        details?: ValidationErrorDetail[];
      };
      message?: string;
    };

    // Check if it's a validation error
    if (details?.error?.code === "VALIDATION_ERROR" && details.error.details) {
      // Extract field-level validation errors
      parsed.fieldErrors = extractValidationErrors(details.error.details);

      // If no field errors were extracted, use the general message
      if (Object.keys(parsed.fieldErrors).length === 0) {
        parsed.generalError = details.error.code || "Validation failed";
      }
    } else {
      // General bad request error
      parsed.generalError =
        details?.message || apiError.error.message || "Invalid request";
    }
    return parsed;
  }

  // Handle other error types
  parsed.generalError =
    apiError.error.message || error.message || "An error occurred";

  return parsed;
}
