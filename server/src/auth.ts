import { User } from './entity/User';
import { sign } from 'jsonwebtoken';

// override TS possibly undefined with ! after declaration

export const createAccessToken = (user: User) => {
	return sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '15m', // check to refresh token at this interval, usually pretty short
	});
};

export const createRefreshToken = (user: User) => {
	return sign(
		{
			userId: user.id,
			tokenVersion: user.tokenVersion,
		},
		process.env.REFRESH_TOKEN_SECRET!,
		{
			expiresIn: '7d', // longish time is good here
		}
	);
};
