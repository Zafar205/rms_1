export type AppRole = "admin" | "cashier";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: AppRole;
};
