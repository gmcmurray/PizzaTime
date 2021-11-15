import React, { useState } from 'react';

const Clock = ({ theme }) => {
	// For digital clock
	let options = { hour12: false };
	let time = new Date().toLocaleTimeString('en-US',options );
	let [ctime, setCTime] = useState();
	const updateTime = () => {
		time = new Date().toLocaleTimeString('en-US',options );
		setCTime(time);
	}
	setInterval(updateTime, 1000);
	return (
		<>
        <h2> {ctime}</h2>
		</>);
}
export default Clock;