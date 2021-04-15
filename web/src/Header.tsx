import React from 'react';
import { Link } from 'react-router-dom';
import { setAccessToken } from './accessToken';
import { useLogoutMutation, useMeQuery } from './generated/graphql';

interface Props {}

export const Header: React.FC = () => {
	// by default, Apollo will cache this query so we can use it
	// throughout our application without sending a network request every time
	// if we want to hit the server for every request, use the commented-out
	// fetchPolicy logic -- good for testing
	const { data, loading } = useMeQuery(/* { fetchPolicy: 'network-only' } */);

	const [logout, { client }] = useLogoutMutation();

	// more than two states pattern
	let body: any = null;

	// check if loading to avoid showing not logged in while loading
	if (loading) {
		body = null;

		// show logged in user
	} else if (data && data.me) {
		body = <div>You are logged in as: {data.me.email}</div>;

		// not logged in msg
	} else {
		body = <div>Not logged in</div>;
	}

	return (
		<header>
			<div>
				<Link to='/'>home</Link>
			</div>
			<div>
				<Link to='/register'>register</Link>
			</div>
			<div>
				<Link to='/login'>login</Link>
			</div>
			<div>
				<Link to='/bye'>bye</Link>
			</div>
			<div>
				{!loading && data && data.me && (
					<button
						onClick={async () => {
							// kill refresh token
							await logout();

							// kill access token
							setAccessToken('');

							// reset Apollo client store
							await client.resetStore();
						}}
					>
						logout
					</button>
				)}
			</div>
			{body}
		</header>
	);
};
