import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './UserResolver';
import { createConnection } from 'typeorm';
import cookieParser from 'cookie-parser';
import { verify } from 'jsonwebtoken';
import cors from 'cors';
import { User } from './entity/User';
import { createAccessToken, createRefreshToken } from './auth';
import { sendRefreshToken } from './sendRefreshToken';

const init = async () => {
	const app = express();

	// add cors middleware
	// helps ApolloServer set cookies
	app.use(
		cors({
			origin: 'http://localhost:3000',
			credentials: true,
		})
	);
	app.use(cookieParser());

	app.get('/', (_req, res) => {
		res.send('hello world');
	});

	// special route for cookies
	app.post('/refresh_token', async (req, res) => {
		// parse token from req.cookies
		// whatever we named it in sendRefreshToken
		const token = req.cookies.zzz;

		// if no token no access
		if (!token) {
			return res.send({ ok: false, accessToken: '' });
		}

		// validate token with verify() and refresh token secret env variable
		let payload: any = null;
		try {
			payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
		} catch (err) {
			console.log(err);

			// if user fetch fails
			return res.send({ ok: false, accessToken: '' });
		}

		// fetch user in db
		const user = await User.findOne({ id: payload.userId });

		// if user fetch fails
		if (!user) {
			return res.send({ ok: false, accessToken: '' });
		}

		// check if token is invalid
		if (user.tokenVersion !== payload.tokenVersion) {
			return res.send({ ok: false, accessToken: '' });
		}

		// allow user to get a refresh token update every time
		// they use the site, allowing them to stay logged in
		sendRefreshToken(res, createRefreshToken(user));

		// create a new access token
		return res.send({ ok: true, accessToken: createAccessToken(user) });
	});

	await createConnection();

	const apolloServer = new ApolloServer({
		// complains unless type-graphql, make sure
		// in ts we're importing from 'type-graphql'
		// not 'graphql'
		schema: await buildSchema({
			resolvers: [UserResolver],
		}),
		// set context
		context: ({ req, res }) => ({ req, res }),
	});

	// set cors to false to add cors ourself
	apolloServer.applyMiddleware({ app, cors: false });

	app.listen(4000, () => {
		console.log('express server started on port 4000');
	});
};

init();
