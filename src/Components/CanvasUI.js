import { getSquares } from '../lib/get-squares'

import { useState, useRef, useEffect } from 'react'
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
import { aspectRatioGenerator } from '../lib/aspectRatioGenerator'

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

	return data
}

const uploadImage = async ({ image }) => {
	const response = await axios.post('http://localhost:8080/upload-image', {
		image,
	})


	const data = response.data

	console.log(data)
	return data.url
}





const CanvasUI = ({
	image,
    setImage,
	clickUpload,
	currentTool,
	workingAreaHeight,
	imageDimensions,
    setImageDimensions,
}) => {
	const [aspectRatio, setAspectRatio] = useState(0)
	const [isLoading, setIsLoading] = useState(false)
	const [loadingAspectRatio, setLoadingAspectRatio] = useState('9/16')
	const [loadingImg, setLoadingImg] = useState('')
	const [textPrompt, setTextPrompt] = useState('')
	const [subMode, setSubmode] = useState('mask')
	const [history, setHistory] = useState([])
    const [imagineData, setImagineData] = useState(null)
    const [messageId, setMessageId] = useState(null)

	const [squares, setSquares] = useState([])

	const drawingComponentRef = useRef(null)

	const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    const callImagineApi = async ({ prompt }) => {
        const response = await axios.post('http://localhost:8080/imagine', {
            prompt,
        })
    
        console.log(response.data)
    
        const messageId = response.data.messageId
    
        const ws = new WebSocket(`ws://localhost:6060/${messageId}`);
        
        await axios.post(`http://localhost:8080/get-imagine-progress`, {
            messageId: messageId,
        })
            ws.onopen = () => {
              console.log('Connected to WebSocket server');
              // You can also send a message to the server after the connection is established
              // ws.send('Hello Server!');
            };
        
            ws.onmessage = (message) => {
              console.log('Received:', message.data);
              setImagineData(JSON.parse(message.data)); // Assuming the server sends JSON data
            };
        
            ws.onerror = (error) => {
              console.error('WebSocket error:', error);
            };
        
            ws.onclose = () => {
              console.log('WebSocket connection closed');
            };
        
            // Clean up the WebSocket connection when the component is unmounted
            return () => {
              ws.close();
            };
    }


      
	const callRemoveObject = async ({ image, maskImage }) => {
		const response = await axios.post(
			'http://localhost:8080/remove-object',
			{
				image,
				maskImage,
			}
		)

		const getUrl = response.data.getUrl

        let newPrediction = { status: 'running' }
		while (
			newPrediction.status !== 'succeeded' ||
			newPrediction.status !== 'failed'
		) {
			await sleep(1000)
			const response = await axios.post(
				'http://localhost:8080/get-prediction',
				{
					getUrl: getUrl,
				}
			)
        
            newPrediction = response.data
            if (newPrediction.output && newPrediction.output.length) { break }
		}
        if (newPrediction.output && newPrediction.output.length) {
            setIsLoading(false)
            setImage(newPrediction.output)
        }
	}

    const callRemoveBackground = async ({ image }) => {
        const response = await axios.post(
            'http://localhost:8080/remove-background',
            {
                image,
            }
        )

        const getUrl = response.data.getUrl

        let newPrediction = { status: 'running' }
        while (
            newPrediction.status !== 'succeeded' ||
            newPrediction.status !== 'failed'
        ) {
            await sleep(1000)
            const response = await axios.post(
                'http://localhost:8080/get-prediction',
                {
                    getUrl: getUrl,
                }
            )

            newPrediction = response.data
            if (newPrediction.output && newPrediction.output.length) { break }
        }
        if (newPrediction.output && newPrediction.output.length) {

            console.log('newPrediction.output', newPrediction.output)
            // reupload newPrediction.output  and get new url
            setImage(newPrediction.output)
            setLoadingImg(newPrediction.output)

            sleep(2000)
            setIsLoading(false)
        }
    }

	const fillGenerate = async (data) => {
		if (!data) return console.log('no data')

		// const { image, scale } = await exportImage({
		// 	canvaRef: data.canvaRef,
		// })

        const canvasData = await drawingComponentRef.current.exportCanvas()


        const { image, scale } = canvasData

        // console.log(image)

		const newSquares = getSquares({
			ratioHeight: data.data.ratioHeight,
			ratioWidth: data.data.ratioWidth,
			canva: data.data.canva,
			image: data.data.image,
			squareSize: data.data.squareSize,
		})


		setLoadingImg(image)
        setLoadingAspectRatio(data.data.ratioWidth + '/' + data.data.ratioHeight)
		setIsLoading(true)

		const newImg = await callApi({
			imageData: image,
			squares: newSquares,
			scale: scale,
			prompt: textPrompt,
		})

		setLoadingImg(newImg.url)
        setImageDimensions(newImg.dimensions)
        setImage(newImg.url)
        setTimeout(() => {
            setIsLoading(false)
        }, 2000)
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
					width: canvasWidth,
				})
			})
		})

	const undo = () => {
		if (history.length < 1) return // Don't undo into an empty state
		drawingComponentRef.current.restoreImage() // Restore
	}

    const runRemove = async (data) => {
        const { image, scale, width, height } = await exportImage({
			canvaRef: data.canvaRef,
		})
		setLoadingImg(image)
		setIsLoading(true)
		setLoadingAspectRatio(`${width}/${height}`)

        const canvasData = await drawingComponentRef.current.exportCanvasWithMask()


        const { imageData, maskImageData } = canvasData

        let base64Data = imageData.replace(
            /^data:image\/png;base64,/,
            ''
        )

        let maskBase64Data = maskImageData.replace(
            /^data:image\/png;base64,/,
            ''
        )

        await callRemoveObject({ image: base64Data, maskImage: maskBase64Data })
		return
	}

    const runRemoveBackground = async (data) => {
        const { image, scale, width, height } = await exportImage({
            canvaRef: data.canvaRef,
        })
        setLoadingImg(image)
        setIsLoading(true)
        setLoadingAspectRatio(`${width}/${height}`)
        const maskData = await drawingComponentRef.current.exportCanvasWithMask()
        const { imageData } = maskData
        let base64Data = imageData.replace(
            /^data:image\/png;base64,/,
            ''
        )
        await callRemoveBackground({ image: base64Data })

        return
    }


	const handleSubmodeChange = (mode) => {
		setSubmode(mode)
		if (mode === 'background') {
			undo()
		}
	}

    const handleRunImagine = async () => {
        if (textPrompt.length < 3) alert('Please enter a prompt')
        if (textPrompt.length > 3) {

            const ar = aspectRatioGenerator(aspectRatio)
            const modifiedPrompt = textPrompt + ' ' + ar
            console.log(modifiedPrompt)
            const imagineRequest = await callImagineApi({ prompt: modifiedPrompt})
            console.log(imagineRequest)
        }
    }


	const addObject = async (data) => {
		const { image, scale, width, height } = await exportImage({
			canvaRef: data.canvaRef,
		})

		setLoadingImg(image)
		setIsLoading(true)
		setLoadingAspectRatio(`${width}/${height}`)

		drawingComponentRef.current.exportCanvasWithMask()

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
		if (currentTool === 'fill') {
			setAspectRatio(0)
		}

		setHistory([])
		setTextPrompt('')
	}, [currentTool])


    const onCancel = () => {
        setIsLoading(false)
        setLoadingImg('')
        setLoadingAspectRatio('')
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
                        onCancel={onCancel}
						aspectRatio={
							loadingAspectRatio
								? loadingAspectRatio
								: aspectRatio
						}
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
							generate={handleRunImagine}
							textPrompt={textPrompt}
							setTextPrompt={setTextPrompt}
							generationText={'fill'}
							isVisible
							isActive
							placeholder={image ? 'Prompt (Optional)' : 'Prompt'}
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
							runRemoveBackground={runRemoveBackground}
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
							placeholder={'Prompt'}
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
