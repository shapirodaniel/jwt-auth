import React from 'react';
import ReactDOM from 'react-dom';
import {
	ApolloProvider,
	ApolloClient,
	createHttpLink,
	InMemoryCache,
	Observable,
	ApolloLink,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { getAccessToken, setAccessToken } from './accessToken';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { App } from './App';
import './index.css';

// set request headers
// from Apollo docs, ApolloLink
// allows us to customize data flow betweeen ApolloClient
// and our GraphQL server (ApolloServer here)
// here we want to introduce an HTTP header
// to the outgoing operation request for authentication purposes
// final link in an ApolloLink chain sends the operation to its destination
// "usually a GraphQL server over HTTP"
// forward method allows us to move to the next link in the chain
const requestLink = new ApolloLink(
	(operation, forward) =>
		new Observable(observer => {
			let handle: any;
			Promise.resolve(operation)
				.then(operation => {
					const accessToken = getAccessToken();
					if (accessToken) {
						operation.setContext({
							headers: {
								authorization: accessToken ? `Bearer ${accessToken}` : '',
							},
						});
					}
				})
				.then(() => {
					// forward function's return type is an Observable
					// provided by zen-observable library
					// Observables are sequences of values which may be observed, eg streams
					// an Observable instance begins publishing values ONLY when someone subscribes to it
					// (from Angular docs --> hopefully holds true here as well!)

					// here we set up a subscriber to the Observable named "handle"
					// so that we can cleanup after the ApolloLink (ie stop listening for pushed values from the Observable)
					handle = forward(operation).subscribe({
						next: observer.next.bind(observer),
						error: observer.error.bind(observer),
						complete: observer.complete.bind(observer),
					});
				})
				.catch(observer.error.bind(observer));

			return () => {
				if (handle) handle.unsubscribe();
			};
		})
);

// set uri
// from Apollo docs
const httpLink = createHttpLink({
	uri: 'http://localhost:4000/graphql',
	credentials: 'include', // for cors
});

// set cache
// from Apollo docs
const cache = new InMemoryCache();

// from Apollo docs
// also, apollo-token-refresh-link lib
// handles extra /refresh_token request when token has timed out during use
// gives user seamless experience
const client = new ApolloClient({
	link: ApolloLink.from([
		new TokenRefreshLink({
			accessTokenField: 'accessToken',
			isTokenValidOrUndefined: () => {
				const token: string = getAccessToken();

				// if token undefined return true
				if (!token) {
					return true;
				}

				try {
					// from jwt-decode docs
					// token carries exp: Int // when token will expire
					// type needs to be imported from lib and declared here
					const { exp } = jwt_decode<JwtPayload>(token);

					// check if exp has exceeded now
					// we know exp exists if we've gotten here
					// so we can ! it
					if (Date.now() >= exp! * 1000) {
						return false;
					} else {
						return true;
					}
				} catch {
					return false;
				}
			},
			fetchAccessToken: () => {
				return fetch('http://localhost:4000/refresh_token', {
					method: 'POST',
					credentials: 'include',
				});
			},
			handleFetch: accessToken => {
				setAccessToken(accessToken);
			},
			// handleResponse: (operation, accessTokenField) => (response: any) => {
			// here you can parse response, handle errors, prepare returned token to further operations
			// returned object should be structured
			// {
			// 	access_token: 'token string goes here'
			// }
			// },
			handleError: err => {
				// full control over handling token fetch Error
				console.warn('Your refresh token is invalid. Try to relogin');
				console.error(err);
			},

			// custom action here
		}),
		onError(({ graphQLErrors, networkError }) => {
			console.log(graphQLErrors);
			console.log(networkError);
		}),
		requestLink,
		httpLink,
	]),
	cache,
});

ReactDOM.render(
	<ApolloProvider client={client}>
		<App />
	</ApolloProvider>,
	document.getElementById('root')
);
