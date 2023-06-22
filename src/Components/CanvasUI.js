import Canvas from './Canvas'
import FillControls from './FillControls'
import EraseControls from './EraseControls'
import CanvasEmpty from './CanvasEmpty'
import PromptBox from './PromptBox'
import SimpleCanvas from './SimpleCanvas'
import LoadingImg from './LoadingImg'

import { getSquares } from '../lib/get-squares'

import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import RemoveButton from './RemoveButton'
import axios from 'axios'

const callApi = async ({ imageData, squares, scale, prompt }) => {
	const response = await axios.post('http://localhost:8080/fill-squares', {
		imageData,
		squares,
		scale,
		textPrompt: prompt.length
			? prompt
			: 'A realistic, high resolution image in the style award winning 4k photography, and images from instagram',
	})

	const data = response.data

	console.log(data)
	return data.url
}

const CanvasUI = ({
	image,
	clickUpload,
	currentTool,
	workingAreaHeight,
	imageDimensions,
}) => {
	const [aspectRatio, setAspectRatio] = useState(0)
	const [isLoading, setIsLoading] = useState(false)
	const [loadingImg, setLoadingImg] = useState('')
	const [textPrompt, setTextPrompt] = useState('')
	const [eraseMode, setEraseMode] = useState('mask')
	const [history, setHistory] = useState([])

	const [squares, setSquares] = useState([])

	const drawingComponentRef = useRef(null)

	const fillGenerate = async (data) => {
		if (!data) return console.log('no data')

		const { image, scale } = await exportImage({
			canvaRef: data.canvaRef,
		})
		const newSquares = getSquares({
			ratioHeight: data.data.ratioHeight,
			ratioWidth: data.data.ratioWidth,
			canva: data.data.canva,
			image: data.data.image,
			squareSize: data.data.squareSize,
		})

		setSquares(newSquares)

		setLoadingImg(image)
		setIsLoading(true)

		const newImg = await callApi({
			imageData: image,
			squares: newSquares,
			scale: scale,
			prompt: textPrompt,
		})

		setLoadingImg(newImg.url)

		console.log(newImg.url)
		// console.log(JSON.stringify(squares))
	}

	// https://usefulangle.com/post/353/javascript-canvas-image-upload
	const exportImage = ({ canvaRef }) =>
		new Promise((resolve, reject) => {
			const element = canvaRef

			const canvasWidth = element.clientWidth
			const canvasHeight = element.clientHeight

			const scale =
				1024 / (canvasWidth < canvasHeight ? canvasWidth : canvasHeight)
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

        const undo = () => {
            if (history.length < 1) return; // Don't undo into an empty state
            drawingComponentRef.current.restoreImage(); // Restore 
          }
        
        const runRemove = () => {
            drawingComponentRef.current.exportCanvas();
        } 

        const handleEraseMode = (mode) => {
            setEraseMode(mode)
            if(mode === 'background') {
                undo()
            }
        }
	return (
		<div>
			{isLoading && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						bottom: 0,
						right: 0,
						left: 0,
						zIndex: 122,
					}}
				>
					<LoadingImg
						img={loadingImg ? loadingImg : ''}
						aspectRatio={aspectRatio}
					/>
				</div>
			)}
			<div style={{ height: workingAreaHeight - 160 }}>
				{image ? (
					<SimpleCanvas
						image={image}
						currentTool={currentTool}
						aspectRatio={aspectRatio}
						workingHeight={workingAreaHeight - 160}
						imageDimensions={imageDimensions}
						squares={squares}
                        setHistory={setHistory}
                        eraseMode={eraseMode}
						ref={drawingComponentRef}
					/>
				) : (
					<CanvasEmpty
                        clickUpload={clickUpload}
                        aspectRatio={aspectRatio}
                        workingHeight={workingAreaHeight - 160}
                    />
				)}
			</div>
			{currentTool === 'fill' && (
				<div>
					<div style={{ height: 80 }}>
                        <PromptBox
                            generate={fillGenerate}
                            textPrompt={textPrompt}
                            setTextPrompt={setTextPrompt}
                        />
					</div>
					<div style={{ height: 80 }}>
						<FillControls
							isVisible={true}
							currentCanvas={aspectRatio}
							setCurrentCanvas={setAspectRatio}
						/>
					</div>
				</div>
			)}
			{currentTool === 'erase' && (
				<div>
					<div style={{ height: 80 }}>
                        <RemoveButton
                            runRemove={runRemove}
                            isRemoveBG={eraseMode === 'background'}
                            canRemove={history.length > 0 || eraseMode === 'background'}
                            isVisible={image ? true : false}
                        />
                    </div>
					<div style={{ height: 80 }}>
						<EraseControls
							isVisible={image ? true : false}
							undo={undo}
                            hasUndo={history.length > 0}
							eraseMode={eraseMode}
							setEraseMode={handleEraseMode}
						/>
					</div>
				</div>
			)}
		</div>
	)
}

export default CanvasUI
