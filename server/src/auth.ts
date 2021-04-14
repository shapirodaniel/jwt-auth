import { User } from './entity/User';
import { sign } from 'jsonwebtoken';

export const createAccessToken = (user: User) => {
	return sign({ userId: user.id }, 'secret', {
		expiresIn: '15m', // generally set this pretty short
	});
};

export const createRefreshToken = (user: User) => {
	return sign({ userId: user.id }, 'anotherSecret', {
		expiresIn: '7d', // longish time is good here
	});
};
