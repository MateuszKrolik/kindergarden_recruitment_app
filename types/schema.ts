import z from "zod";

export const signInSchema = z.object({
  email: z.string().email({ error: "Invalid email address!" }),
  password: z.string().min(1),
});
