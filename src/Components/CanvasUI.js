import Canvas from './Canvas'
import FillControls from './FillControls'
import CanvasEmpty from './CanvasEmpty';
import PromptBox from './PromptBox'
import SimpleCanvas from './SimpleCanvas'
import LoadingImg from './LoadingImg';

import { getSquares } from '../lib/get-squares';

import { useState } from 'react';
import html2canvas from 'html2canvas'
import axios from 'axios';

const callApi = async ({ imageData, squares, scale }) => {
    const response = await axios.post('http://localhost:8080/fill-squares', {
        imageData,
        squares,
        scale,
        textPrompt: 'A realistic, high resolution image in the style award winning 4k photography, and images from instagram'
    });

    const data = response.data;

    console.log(data)
    return data.url
}

const CanvasUI = ({ image, clickUpload, currentTool, workingAreaHeight, imageDimensions }) => {
    const [aspectRatio, setAspectRatio] = useState(0);
    const [isLoading, setIsLoading] = useState(false)

    const loadGeneration = (index) => {
        setIsLoading(true)
    }

    const fillGenerate = async (data) => {
        if (!data) return console.log('no data')

        const { image, scale } = await exportImage({
            canvaRef: data.canvaRef,
        })
        const squares = getSquares({
            ratioHeight: data.data.ratioHeight,
            ratioWidth: data.data.ratioWidth,
            canva: data.data.canva,
            image: data.data.image,
            squareSize: data.data.squareSize,
        })


        await callApi({
            imageData: image,
            squares: squares,
            scale: scale,
        })

        console.log(JSON.stringify(squares))
    }

    // https://usefulangle.com/post/353/javascript-canvas-image-upload
    const exportImage = ({ canvaRef }) => new Promise((resolve, reject) => {
		const element = canvaRef

		const canvasWidth = element.clientWidth
		const canvasHeight = element.clientHeight

        const scale = 1024 / (canvasWidth < canvasHeight ? canvasWidth : canvasHeight)
		html2canvas(element, {
			backgroundColor: null,
			logging: true,
			width: canvasWidth,
			height: canvasHeight,
			scale,
		}).then((canvas) => {
			// get the image data
			const image = canvas.toDataURL('image/png')
            resolve({
                image,
                scale,
            })
		})
	})

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
                    {image ? <PromptBox generate={fillGenerate}/> : null}
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