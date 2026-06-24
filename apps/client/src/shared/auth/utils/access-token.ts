let accessToken: string | undefined = undefined;

export const getAccessToken = (): string | undefined => {
  return accessToken;
};

export const setAccessToken = (newAccessToken: string) => {
  accessToken = newAccessToken;
};

export const clearAccessToken = () => {
  accessToken = undefined;
};
