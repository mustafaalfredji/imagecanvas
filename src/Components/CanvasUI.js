import { getSquares } from '../lib/get-squares'

import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import axios from 'axios'

import FillControls from './FillControls'
import EraseControls from './EraseControls'
import AddControls from './AddControls'
import CanvasEmpty from './CanvasEmpty'
import PromptBox from './PromptBox'
import SimpleCanvas from './SimpleCanvas'
import LoadingImg from './LoadingImg'

import RemoveButton from './RemoveButton'

import { useEffect } from 'react'

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
    const [loadingAspectRatio, setLoadingAspectRatio] = useState('9/16')
	const [loadingImg, setLoadingImg] = useState('')
	const [textPrompt, setTextPrompt] = useState('')
	const [subMode, setSubmode] = useState('mask')
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

            console.log(canvasWidth, canvasHeight)

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
                    height: canvasHeight,
                    width: canvasWidth
				})
			})
		})

	const undo = () => {
		if (history.length < 1) return // Don't undo into an empty state
		drawingComponentRef.current.restoreImage() // Restore
	}

	const runRemove = () => {
		drawingComponentRef.current.exportCanvas()
	}


	const handleSubmodeChange = (mode) => {
		setSubmode(mode)
		if (mode === 'background') {
			undo()
		}
	}

    const addObject = async (data) => {
        const { image, scale, width, height } = await exportImage({
			canvaRef: data.canvaRef,
		})

        setLoadingImg(image)
		setIsLoading(true)
        setLoadingAspectRatio(`${width}/${height}`)

        drawingComponentRef.current.exportCanvas()
        
        setTimeout(() => {
            setLoadingImg('')
            setIsLoading(false)
            setLoadingAspectRatio('')
        }, 3000)
    }

    useEffect(() => {
        //when the current tool changes, reset the history, run undo and reset the prompt
        if (currentTool !== 'fill') {
            undo()
        }
        if(currentTool === 'fill') {
            setAspectRatio(0)
        }

        setHistory([])
        setTextPrompt('')
    }, [currentTool])


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
						aspectRatio={loadingAspectRatio ? loadingAspectRatio : aspectRatio}
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
						eraseMode={subMode}
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
							generationText={'fill'}
							isVisible
                            isActive
							isOptional={image ? true : false}
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
							runRemoveBackground={() =>
								console.log('remove background')
							}
							isRemoveBG={subMode === 'background'}
							canRemove={
								history.length > 0 || subMode === 'background'
							}
							isVisible={image ? true : false}
						/>
					</div>
					<div style={{ height: 80 }}>
						<EraseControls
							isVisible={image ? true : false}
							undo={undo}
							hasUndo={history.length > 0}
							eraseMode={subMode}
							setEraseMode={handleSubmodeChange}
						/>
					</div>
				</div>
			)}
			{currentTool === 'add' && (
				<div>
					<div style={{ height: 80 }}>
						<PromptBox
							generate={addObject}
							textPrompt={textPrompt}
							setTextPrompt={setTextPrompt}
							generationText={'Add'}
							isVisible={image ? true : false}
                            isActive={history.length > 0}
						/>
					</div>
					<div style={{ height: 80 }}>
						<AddControls
							isVisible={image ? true : false}
							undo={undo}
							hasUndo={history.length > 0}
							subMode={subMode}
							setSubmode={handleSubmodeChange}
						/>
					</div>
				</div>
			)}
		</div>
	)
}

export default CanvasUI
