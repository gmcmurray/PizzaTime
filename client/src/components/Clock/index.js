import React, { useState } from 'react';

const Clock = ({ theme }) => {
	// For digital clock
	let time = new Date().toLocaleTimeString();
	let [ctime, setCTime] = useState();
	const updateTime = () => {
		time = new Date().toLocaleTimeString();
		setCTime(time);
	}
	setInterval(updateTime, 1000);
	return (
		<>
        <h2> {ctime}.</h2>
		</>);
}
export default Clock;