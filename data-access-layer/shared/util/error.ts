export async function catchError<T>(
  promise: Promise<T>,
): Promise<{ data?: T; error?: Error }> {
  return promise
    .then((data) => {
      return { data: data, error: undefined };
    })
    .catch((error) => {
      return { data: undefined, error: error };
    });
}

export function catchErrorSync<T>(operation: () => T): {
  data?: T;
  error?: Error;
} {
  try {
    const result = operation();
    return { data: result, error: undefined };
  } catch (error) {
    return {
      data: undefined,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export function formatAggregateError(errors: Error[]): Error {
  if (errors.length === 1) {
    return errors[0];
  }

  const errorMessages = errors
    .map((error, index) => `${index + 1}. ${error.message}`)
    .join("\n    ");

  return new Error(`${errors.length} Errors occurred:\n    ${errorMessages}`);
}
