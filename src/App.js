// import Canvas from './Components/Canvas';
// import CanvasEmpty from './Components/CanvasEmpty';
// import CanvasControls from './Components/FillControls';
import { useState } from 'react';

import Footer from './Components/Footer';
import CanvasUI from './Components/CanvasUI';


import './App.css';

function App() {


  return (
    <div className="App">
       <CanvasUI workingAreaHeight={window.innerHeight}/>
    </div>
  );
}

export default App;
