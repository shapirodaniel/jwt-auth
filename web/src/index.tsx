import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ApolloProvider } from '@apollo/react-hooks';
import './index.css';
import { Routes } from './Routes';
import reportWebVitals from './reportWebVitals';
import { getAccessToken } from './accessToken';

const httpLink = createHttpLink({
	uri: 'http://localhost:4000/graphql',
});

const authLink = setContext((_req, { headers }) => {
	const token = getAccessToken();
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : '',
		},
	};
});

const client = new ApolloClient({
	credentials: 'include',
	cache: new InMemoryCache(),
	link: authLink.concat(httpLink),
});

ReactDOM.render(
	<ApolloProvider client={client}>
		<Routes />
	</ApolloProvider>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
