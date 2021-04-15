let accessToken = '';

export const setAccessToken = (str: string) => (accessToken = str);

export const getAccessToken = () => accessToken;
