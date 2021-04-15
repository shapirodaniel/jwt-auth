import { Response } from 'express';

// encapsulate the refresh token logic
// so we only have to update in one place
export const sendRefreshToken = (res: Response, token: string) => {
	res.cookie('jid', token, {
		httpOnly: true,
		path: '/refresh_token',
	});
};
