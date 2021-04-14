import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from '@apollo/client';
import './App.css';

const App: React.FC = () => {
	const { data, loading } = useQuery(gql`
		{
			hello
		}
	`);

	if (loading) {
		return <div>loading ...</div>;
	} else {
		return <div>{JSON.stringify(data)}</div>;
	}
};

export default App;
