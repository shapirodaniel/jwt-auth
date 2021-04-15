import {
	Resolver,
	Query,
	Mutation,
	Arg,
	ObjectType,
	Field,
	Ctx,
	UseMiddleware,
	Int,
} from 'type-graphql';
import { hash, compare } from 'bcryptjs';
import { User } from './entity/User';
import { MyContext } from './MyContext';
import { createAccessToken, createRefreshToken } from './auth';
import { isAuth } from './isAuth';
import { sendRefreshToken } from './sendRefreshToken';
import { getConnection } from 'typeorm';
import { verify } from 'jsonwebtoken';
@ObjectType()
class LoginResponse {
	@Field()
	accessToken: string;
	@Field(() => User) // let graphql know the type
	user: User;
}

@Resolver()
export class UserResolver {
	// declare type that query returns with anonymous function returning type
	@Query(() => String)
	hello() {
		return 'hi!';
	}

	// check if access token in header, validate if correct
	@Query(() => String)
	@UseMiddleware(isAuth)
	bye(@Ctx() { payload }: MyContext) {
		console.log(payload);
		// we know userId will be available if we get to this point
		return `your user id is: ${payload!.userId}`;
	}

	// return array of all users in db
	@Query(() => [User])
	users() {
		return User.find();
	}

	@Query(() => User, { nullable: true })
	me(@Ctx() context: MyContext) {
		// check if user sent us an accessToken
		const authorization = context.req.headers['authorization'];

		if (!authorization) {
			return null;
		}

		try {
			const token = authorization.split(' ')[1];
			const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);
			return User.findOne(payload.userId);
		} catch (err) {
			console.log(err);
			return null;
		}

		return null;
	}

	@Mutation(() => Boolean)
	// type-graphql can infer type, but explicit type can
	// be provided as second arg to @Arg
	async register(
		@Arg('email', () => String) email: string,
		@Arg('password') password: string
	) {
		// hash returns a promise, takes a password and a salt rounds int
		const hashedPassword = await hash(password, 12);

		// add user to db, return a boolean if success/fail
		try {
			await User.insert({
				email,
				password: hashedPassword,
			});
		} catch (err) {
			console.error(err);
			return false;
		}

		return true;
	}

	// don't actually make a mutation like this
	// make a function for internal use if someone forgets a pswd
	// or their account gets hacked
	@Mutation(() => Boolean)
	async revokeRefreshTokensForUser(@Arg('userId', () => Int) userId: number) {
		await getConnection()
			.getRepository(User)
			// typeORM has a built-in increment function
			// that takes the following args:
			// the object used to find the instance
			// the field to increment
			// the value to increment by
			.increment({ id: userId }, 'tokenVersion', 1);

		// tokenVersion provides a history
		// of how many times a user has needed
		// to update their login info (due to hacks or otherwise)
		return true;
	}

	@Mutation(() => LoginResponse)
	async login(
		@Arg('email', () => String) email: string,
		@Arg('password') password: string,
		@Ctx() { res }: MyContext
	): Promise<LoginResponse> {
		// get user
		const user = await User.findOne({
			where: {
				email,
			},
		});

		// if no user throw user not found
		if (!user) {
			throw new Error('could not find user');
		}

		// check password with bcrypt compare(current, stored)
		const valid = await compare(password, user.password);

		// if wrong password throw
		if (!valid) {
			throw new Error('wrong password');
		}

		// login successful
		// generate a refresh token
		sendRefreshToken(res, createRefreshToken(user));

		// give users tokens to stay logged in, access other parts of site
		return {
			// sign() fn generates accessToken
			// takes object with info we want, a secret string, options/config obj
			accessToken: createAccessToken(user),
			user,
		};
	}

	@Mutation(() => Boolean)
	async logout(@Ctx() { res }: MyContext) {
		// send an empty refresh token to log user out
		sendRefreshToken(res, '');
		// or, res.clearCookie() --> but sendRefreshToken guarantees
		// all cookie attributes match

		return true;
	}
}
