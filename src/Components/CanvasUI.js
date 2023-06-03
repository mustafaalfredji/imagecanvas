import Canvas from './Canvas'
import FillControls from './FillControls'
import CanvasEmpty from './CanvasEmpty';
import PromptBox from './PromptBox'
import SimpleCanvas from './SimpleCanvas'
import LoadingImg from './LoadingImg';

import { useState } from 'react';

const CanvasUI = ({ image, clickUpload, currentTool, workingAreaHeight, imageDimensions }) => {
    const [aspectRatio, setAspectRatio] = useState(0);
    const [isLoading, setIsLoading] = useState(false)

    const loadGeneration = (index) => {
        setIsLoading(true)
    }

    return (
        <div>
            {isLoading && (
                 <div style={{ position: 'fixed', top: 0, bottom: 0, right: 0, left: 0, zIndex: 11 }}>
                    <LoadingImg
                        img={'https://images.pexels.com/photos/5230612/pexels-photo-5230612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
                        aspectRatio={aspectRatio}
                    />
                </div>
                )}
            <div style={{ height: workingAreaHeight - 160}}>
            {image ? (
                <SimpleCanvas
                    image={image}
                    currentTool={currentTool}
                    aspectRatio={aspectRatio}
                    workingHeight={workingAreaHeight - 160}
                    imageDimensions={imageDimensions}
                />
            ) : (
                <CanvasEmpty clickUpload={clickUpload} />
            )}

            
            </div>
            {currentTool === 'fill' && (
                <div>
                    <div style={{ height: 80}}>
                    {image ? <PromptBox /> : null}
                    </div>
                     <div style={{ height: 80}}>
                        <FillControls
                            isVisible={image ? true : false}
                            currentCanvas={aspectRatio}
                            setCurrentCanvas={setAspectRatio}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default CanvasUI