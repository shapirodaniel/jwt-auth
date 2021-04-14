import React from 'react';
import { useUsersQuery } from '../generated/graphql';

interface Props {}

export const Home: React.FC<Props> = () => {
	// don't read from cache -- use data from server only
	const { data } = useUsersQuery({ fetchPolicy: 'network-only' });

	if (!data) {
		return <div>loading ...</div>;
	}

	return (
		<div>
			<div>users:</div>
			<ul>
				{data.users.map(user => (
					<li key={user.id}>
						{user.email}, {user.id}
					</li>
				))}
			</ul>
		</div>
	);
};
