import { NextResponse } from 'next/server';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class InvalidActivityError extends AppError {
  constructor(details?: unknown) {
    super('Invalid activity data provided', 'INVALID_ACTIVITY', 400, details);
  }
}

export class InvalidScenarioError extends AppError {
  constructor(details?: unknown) {
    super('Invalid scenario data provided', 'INVALID_SCENARIO', 400, details);
  }
}

export class InvalidGoalError extends AppError {
  constructor(details?: unknown) {
    super('Invalid goal parameters provided', 'INVALID_GOAL', 400, details);
  }
}

export class CalculationFailedError extends AppError {
  constructor(message: string = 'Calculation failed', details?: unknown) {
    super(message, 'CALCULATION_FAILED', 500, details);
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.code, message: error.message, details: error.details },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN_ADMIN_ONLY' || error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'FORBIDDEN', message: 'Forbidden' }, { status: 403 });
    }
  }

  console.error('Unhandled API Error:', error);
  return NextResponse.json(
    { error: 'INTERNAL_SERVER_ERROR', message: 'An unexpected internal error occurred' },
    { status: 500 }
  );
}
