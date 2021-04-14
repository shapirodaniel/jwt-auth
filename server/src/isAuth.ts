import { verify } from 'jsonwebtoken';
import { MiddlewareFn } from 'type-graphql';
import { MyContext } from './MyContext';

// expect bearer 102353askjgsjkehg

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
	const authorization = context.req.headers['authorization'];

	// if user didn't pass a header with the req, reject
	if (!authorization) {
		throw new Error('user not authenticated');
	}

	try {
		const token = authorization.split(' ')[1];

		// payload is whatever we passed in to sign() fn
		const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);

		// since payload type is string OR object, alias as "any" here
		context.payload = payload as any;
	} catch (err) {
		console.log(err);
		throw new Error('not authenticated');
	}

	// when current middleware logic is done, call next()
	return next();
};
