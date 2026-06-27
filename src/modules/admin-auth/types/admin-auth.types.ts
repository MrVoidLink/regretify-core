export type AdminAccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
  status?: string;
};

export type AuthenticatedAdmin = AdminAccessTokenPayload;
