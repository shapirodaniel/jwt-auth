import {
	Resolver,
	Query,
	Mutation,
	Arg,
	ObjectType,
	Field,
	Ctx,
} from 'type-graphql';
import { hash, compare } from 'bcryptjs';
import { User } from './entity/User';
import { MyContext } from './MyContext';
import { createAccessToken, createRefreshToken } from './auth';

@ObjectType()
class LoginResponse {
	@Field()
	accessToken: string;
}

@Resolver()
export class UserResolver {
	// declare type that query returns with anonymous function returning type
	@Query(() => String)
	hello() {
		return 'hi!';
	}

	// return array of all users in db
	@Query(() => [User])
	users() {
		return User.find();
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
		// pick a generic id name
		res.cookie('jid', createRefreshToken, {
			httpOnly: true, // restrict access to cookie to http
		});

		// give users tokens to stay logged in, access other parts of site
		return {
			// sign() fn generates accessToken
			// takes object with info we want, a secret string, options/config obj
			accessToken: createAccessToken(user),
		};
	}
}
