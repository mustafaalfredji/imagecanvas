// import Canvas from './Components/Canvas';
// import CanvasEmpty from './Components/CanvasEmpty';
// import CanvasControls from './Components/FillControls';
import { useState, useRef } from 'react';

import Footer from './Components/Footer';
import CanvasUI from './Components/CanvasUI';


import './App.css';

function App() {
  const [image, setImage] = useState('');
  const [imageDimensions, setImageDimensions] = useState({ width: 10, height: 10 })
  const [currentTool, setCurrentTool] = useState('fill');

  const inputRef = useRef(null); // Reference to the hidden file input

    // Handle the upload event, converting image to a base64 encoded string
    const handleUpload = (e) => {
        let file = e.target.files[0]; // Get the uploaded file

        // if user cancels the upload, file would be undefined. Guard clause for that
        if (!file) {
            return;
        }

        let reader = new FileReader(); // Create a new FileReader
        reader.onloadend = async (e) => {
              let image = new Image()
              image.src = e.target.result
              await image.decode()
              // now we can:
              const width = image.width
              const height = image.height
              setImageDimensions({ width, height })
              setImage(reader.result); // Store the base64 encoded image in state
            }
        reader.readAsDataURL(file); // Convert image to base64 encoded string

    }

    // Trigger the hidden file input when the div is clicked
    const handleClick = () => {
        inputRef.current.click();
    }


  return (
    <div className="App">
      <input type="file" accept="image/*" onChange={handleUpload} ref={inputRef} style={{display: 'none'}} />
      <div  style={{
        height: window.innerHeight - 80 ,
      }}>
        <CanvasUI
          currentTool={currentTool}
          image={image}
          imageDimensions={imageDimensions}
          clickUpload={handleClick}
          workingAreaHeight={window.innerHeight - 80}
        />
      </div>
      
      <Footer
        setCurrentTool={setCurrentTool}
        currentTool={currentTool}
      />
     
    </div>
  );
}

export default App;
