export type AuthUser = {
  id: string;
  email: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};
