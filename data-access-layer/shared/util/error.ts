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
