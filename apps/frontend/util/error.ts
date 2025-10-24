export const getErrorMessage = (error: unknown): string => {
  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message);
  } else if (typeof error == "string") {
    message = error;
  } else {
    message = "Something went wrong!";
  }
  return message;
};

export async function catchError<T>(
  promise: Promise<T>,
): Promise<{ data: T; error: undefined } | { data: undefined; error: Error }> {
  return promise
    .then((data) => {
      return { data: data, error: undefined };
    })
    .catch((error) => {
      return { data: undefined, error: error };
    });
}
