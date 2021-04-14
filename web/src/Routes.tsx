import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Home, Login, Register } from './pages';
import './Routes.css';

export const Routes: React.FC = () => {
	return (
		<Router>
			<div>
				<header>
					<div>
						<Link to='/register'>register</Link>
					</div>
					<div>
						<Link to='/login'>login</Link>
					</div>
				</header>
				<Switch>
					<Route exact path='/' component={Home} />
					<Route exact path='/register' component={Register} />
					<Route exact path='/login' component={Login} />
				</Switch>
			</div>
		</Router>
	);
};
