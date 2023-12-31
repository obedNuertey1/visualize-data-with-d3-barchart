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

			//Creating the Scale
			const [xScale, yScale] = [
				d3.scaleTime()
					.domain(d3.extent(dataset, d => new Date(d[0])))
					.range([padding, w - padding]),
				d3.scaleLinear()
					.domain([0, d3.max(dataset, (d) => (d[1]))])
					.range([h - padding, padding])
			];
			//Creating the shapes
			const shape = svg.selectAll("rect")
			.data(dataset)
			.enter()
			.append("rect").attr('class', 'bar').attr("data-date", (d) => (d[0])).attr("data-gdp", (d)=>(d[1]))
			.attr("height", d => yScale(0) - yScale(d[1]))
			.attr("width", `${(w - 2 * padding) / dataset.length}px`)
			.attr("x", (d, i) => xScale(new Date(d[0])))
			.attr("y", d => yScale(d[1]));

			//Label
			const yearRegex = /\d{4}/ig;
			shape.on("mouseenter", (i, d)=>{
				d3.select(".mainContainer").append("div").attr("id", "tooltip").attr("data-date", (d[0])).html(()=>{
					return (parseInt(d[0].split('-')[1]) >= 1 && parseInt(d[0].split('-')[1]) < 4)?(`<div>Date: ${d[0].match(yearRegex)} Q1 <br> GDP: $${d[1]} Billion</div>`):(parseInt(d[0].split('-')[1]) >= 4 && parseInt(d[0].split('-')[1]) < 7)?(`<div>Date: ${d[0].match(yearRegex)} Q2 <br> GDP: $${d[1]} Billion</div>`):(parseInt(d[0].split('-')[1]) >= 7 && parseInt(d[0].split('-')[1]) < 10)?(`<div>Date: ${d[0].match(yearRegex)} Q3 <br> GDP: $${d[1]} Billion</div>`):(`<div>Date: ${d[0].match(yearRegex)} Q4 <br> GDP: $${d[1]} Billion</div>`)});
			}).on("mouseout", ()=>{d3.select("#tooltip").remove()});

			//Create xAxis and yAxis
			const [xAxis, yAxis] = [d3.axisBottom(xScale), d3.axisLeft(yScale)];

			svg.append("g").attr("transform", `translate(0, ${h - padding})`).attr('id', 'x-axis').call(xAxis); //render xAxis
			svg.append("g").attr("transform", `translate(${padding}, 0)`).attr('id', 'y-axis').call(yAxis).append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 250)
			.attr("dy", "250")
			.style("text-anchor", "end")
			.text("Y-axis Label"); //render yAxis
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