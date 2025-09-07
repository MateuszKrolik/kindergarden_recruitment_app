export async function catchError<T>(
  promise: Promise<T>,
): Promise<[undefined, T] | [Error]> {
  return promise
    .then((data) => {
      return [undefined, data] as [undefined, T];
    })
    .catch((error) => {
      return [error];
    });
}

export function catchSyncError<T>(
  operation: () => T,
): [undefined, T] | [Error] {
  try {
    const result = operation();
    return [undefined, result];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error))];
  }
}
