import { Resolver, Query } from 'type-graphql';

@Resolver()
export class UserResolver {
	// declare type that query returns with anonymous function returning type
	@Query(() => String)
	hello() {
		return 'hi!';
	}
}
