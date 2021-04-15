import React, { useEffect, useState } from 'react';
import { setAccessToken } from './accessToken';
import { Routes } from './Routes';

interface Props {}

export const App: React.FC<Props> = () => {
	const [loading, setLoading] = useState(true);

	// persist user between refreshes
	// get and set a new accessToken

	useEffect(() => {
		fetch('http://localhost:4000/refresh_token', {
			method: 'POST',
			credentials: 'include',
		}).then(async incoming => {
			const { accessToken } = await incoming.json();
			setAccessToken(accessToken);
			setLoading(false);
		});
	}, []);

	// before App renders
	// this is when we try to refresh token
	// if we get a token back we load the entire application
	if (loading) {
		return <div>loading ...</div>;
	}

	return <Routes />;
};
