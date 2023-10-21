import React, { startTransition } from 'react';
import './style.css';
import {Provider, connect} from 'react-redux';
import {createStore, combineReducers, applyMiddleware} from 'redux';
import "bootstrap/dist/css/bootstrap.min.css";
import {Button, Card, Nav, Col, Row, Image} from 'react-bootstrap';
import { findDOMNode } from 'react-dom';
import $ from 'jquery';
import thunk from 'redux-thunk';
import {PropTypes} from 'prop-types';
import * as d3 from 'd3';

//REACT-REDUX part1 ends

class Main extends React.Component{
	constructor(props){
		super(props);
		this.showSVG = this.showSVG.bind(this);
	}
	shouldComponentUpdate(nextState, nextProps){
		return true;
	}

	componentWillMount(){
		$('body').addClass('backgroundColor');
	}
	componentWillUnmount(){
		document.removeEventListener('DOMContentLoaded', this.showSVG());
	}
	componentDidMount(){
		document.addEventListener('DOMContentLoaded', this.showSVG());
	}

	showSVG(){
		//Getting the data
		const req = new XMLHttpRequest();
		const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';
		req.open("GET", url, true);
		req.send();
		req.onload = () => {
			const json = JSON.parse(req.responseText);
			let dataset = [...json["data"]];

			//D3 operations
			//Define the width and height of the svg
			const [w, h, padding] = [980, 460, 40];
			
			//Create the svg
			const svg = d3.select("svg").attr("width", w).attr("height", h);
			

			//Create the xScale and yScale
			const dateRegex = /\d{4}/gi; //get the first four digits
			let yearArray = [];
			dataset.forEach((data)=>{
				yearArray.push(parseInt(data[0].match(dateRegex)));
			});

			let myValues = Array.from(new Map(yearArray.map(x => [x, x])).values());

			let fiveMultVals = myValues.filter((elem)=>(elem % 5 === 0));

			let scaleDisplay = [];
			fiveMultVals.forEach((val)=>{
				scaleDisplay.push(new Date(parseInt(val), 0, 1));
			});

			let distinctValues = [];
			myValues.forEach((data)=>{
				distinctValues.push(new Date(parseInt(data), 0, 1));
			});


			const [xScale, yScale] = [
  d3.scaleTime().domain([distinctValues[0], distinctValues[distinctValues.length - 1]]).range([padding, w - padding]),
  d3.scaleLinear().domain([0, d3.max(dataset, (d) => (d[1]))]).range([h - padding, padding])
];
			//Creating the shapes
			svg.selectAll("rect").data(dataset).enter().append("rect").attr("height", (d, i) => (d[1])).attr("width", `${2}px`).attr("x", (d, i) => xScale(i*2.2)).attr("y", 0);

			//Create xAxis and yAxis
			const [xAxis, yAxis] = [d3.axisBottom(xScale)
  .tickValues(scaleDisplay)
  .tickFormat(d3.timeFormat('%Y')), d3.axisLeft(yScale)];

			svg.append("g").attr("transform", `translate(0, ${h - padding})`).attr('id', 'x-axis').call(xAxis); //render xAxis
			svg.append("g").attr("transform", `translate(${padding}, 0)`).attr('id', 'y-axis').call(yAxis); //render yAxis
		}
	}


	render(){
		return(
			<div className="wrapperContainer">
				<div className='mainContainer'>
					<div id='title'>United States GDP</div>
					<svg></svg>
					<div className='link'><span>More Information: http://www.bea.gov/national/pdf/nipaguid.pdf</span></div>
				</div>
			</div>
		);
	}
};

export default Main;