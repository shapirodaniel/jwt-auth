import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Home, Login, Register, Bye } from './pages';
import { Header } from './Header';
import './Routes.css';

export const Routes: React.FC = () => {
	return (
		<Router>
			<div>
				<Header />
				<Switch>
					<Route exact path='/' component={Home} />
					<Route exact path='/register' component={Register} />
					<Route exact path='/login' component={Login} />
					<Route exact path='/bye' component={Bye} />
				</Switch>
			</div>
		</Router>
	);
};
