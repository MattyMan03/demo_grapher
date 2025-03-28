import React, { Component } from 'react';
import { ReactP5Wrapper } from "react-p5-wrapper";
import sketch from './sketch';
import './App.css';

class App extends Component {
  constructor(){
    super();
  }

  render() {
    return (
      <div>
        <ReactP5Wrapper sketch={sketch}></ReactP5Wrapper>
      </div>
    );
  }
}

export default App;