export type AdminAccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
};

export type AuthenticatedAdmin = AdminAccessTokenPayload;
