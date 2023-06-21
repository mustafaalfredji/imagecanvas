import { useSpring, animated } from '@react-spring/web'
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react'
import { forwardRef, useEffect, useRef, useState, useImperativeHandle } from 'react'

import './canvas.css'
import { styles } from './styles'

const aspectRatioGenerator = (index) => {
	if (index === 0) {
		return {
			width: 9,
			height: 16,
			ratio: '9/16',
		}
	}
	if (index === 1) {
		return {
			width: 3,
			height: 4,
			ratio: '3/4',
		}
	}
	if (index === 2) {
		return {
			width: 1,
			height: 1,
			ratio: '1/1',
		}
	}
	if (index === 3) {
		return {
			width: 4,
			height: 3,
			ratio: '4/3',
		}
	}
	if (index === 4) {
		return {
			width: 16,
			height: 9,
			ratio: '16/9',
		}
	}
}

const randomizeColorRGB = () => {
	const r = Math.floor(Math.random() * 255)
	const g = Math.floor(Math.random() * 255)
	const b = Math.floor(Math.random() * 255)
	return `rgb(${r}, ${g}, ${b})`
}

const Canvas = forwardRef((props, ref) => {

	const { aspectRatio,
		image,
		workingHeight,
		imageDimensions,
		squares,
		currentTool,
		setUndoHistory,
		undoHistory,
		history,
		setHistory
	} = props

	const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })
	const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 })
	const [canvasDimensions, setCanvasDimensions] = useState({
		width: 0,
		height: 0,
	})
	const [isDrawing, setIsDrawing] = useState(false)
	const ratioInfo = aspectRatioGenerator(aspectRatio)

	// set the image width to be the height of the canvas
	const [imgSpringStyle, api] = useSpring(() => ({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	}))

	// set the image width to be the height of the canvas
	const [canvasStyles, canvasApi] = useSpring(() => ({
		width: 0,
		height: 0,
		scale: 1,
	}))

	const canvasRef = useRef(null)
	const imgRef = useRef(null)
	const maskRef = useRef(null)

	const useGesture = createUseGesture([dragAction, pinchAction])

	// manage pinch and drag gestures
	const bind = useGesture(
		{
			onDrag: ({
				pinching,
				down,
				movement: [x, y],
				dragging,
				cancel,
			}) => {
				if (pinching) return cancel()

				// Get the current image and canvas dimensions
				const canvasWidth = canvasDimensions.width
				const canvasHeight = canvasDimensions.height
				const imgWidth = imgDimensions.width
				const imgHeight = imgDimensions.height

				// Calculate the boundaries for dragging
				const minX = Math.min(0, canvasWidth * 0.2 - imgWidth) // At least 20% of the image's width should be within the canvas
				const minY = Math.min(0, canvasHeight * 0.2 - imgHeight) // At least 20% of the image's height should be within the canvas
				const maxX = Math.max(0, canvasWidth - canvasWidth * 0.2) // At least 20% of the image's width should be within the canvas
				const maxY = Math.max(0, canvasHeight - canvasHeight * 0.2) // At least 20% of the image's height should be within the canvas

				// Clamp the drag movement within these boundaries
				const clampedX = Math.max(
					minX,
					Math.min(maxX, coordinates.x + x)
				)
				const clampedY = Math.max(
					minY,
					Math.min(maxY, coordinates.y + y)
				)

				api.start({
					x: clampedX,
					y: clampedY,
					immediate: true,
				})
				if (!down && !dragging) {
					setCoordinates({
						x: clampedX,
						y: clampedY,
					})
				}
			},
			onPinch: ({
				origin: [ox, oy],
				first,
				movement: [ms],
				offset: [s, a],
				memo,
				down,
				pinching,
				cancel,
			}) => {

				if (currentTool === 'fill') {
					if (first) {
						const { width, height, x, y } =
							imgRef.current.getBoundingClientRect()
						const tx = ox - (x + width / 2)
						const ty = oy - (y + height / 2)
						memo = [
							imgSpringStyle.x.get(),
							imgSpringStyle.y.get(),
							tx,
							ty,
							width,
							height,
						]
					}
	
					const aspectRatio =
						imageDimensions.width / imageDimensions.height
	
					const canvasWidth = canvasDimensions.width
					const canvasHeight = canvasDimensions.height
	
					const minimumWidth = canvasWidth * 0.2
					const minimumHeight = canvasHeight * 0.2
	
					let newHeight
					let newWidth
	
					if (aspectRatio > 1) {
						newHeight =
							imageDimensions.height * s < minimumHeight
								? minimumHeight
								: imageDimensions.height * s
						newWidth = newHeight * aspectRatio
					}
					if (aspectRatio < 1) {
						newWidth =
							imageDimensions.width * s < minimumWidth
								? minimumWidth
								: imageDimensions.width * s
						newHeight = newWidth / aspectRatio
					}
					if (aspectRatio === 1) {
						newWidth =
							imageDimensions.width * s < minimumWidth
								? minimumWidth
								: imageDimensions.width * s
						newHeight = newWidth
					}
	
					const dx = (newWidth - memo[4]) / 2
					const dy = (newHeight - memo[5]) / 2
	
					const x = memo[0] - dx - (ms - 1) * memo[2]
					const y = memo[1] - dy - (ms - 1) * memo[3]
	
					api.start({
						width: newWidth,
						height: newHeight,
						x: x,
						y: y,
						immediate: true,
					})
	
					if (!pinching) {
						setCoordinates({
							x: x,
							y: y,
						})
	
						setImgDimensions({
							width: newWidth,
							height: newHeight,
						})
					}
	
					return memo
				}

				// if (currentTool === 'erase' || currentTool === 'add') {

				// 	const dampingFactor = 0.9; // change this value as needed
			
				// 	// scale the canvas on pinch, scale can never be less than 1
				// 	const newScale = 1 * s * dampingFactor;
				// 	if (newScale < 1) return cancel()
			
				// 	canvasApi.start({
				// 		scale: newScale,
				// 		immediate: true,
				// 	})
				// }
			}
		},
		{
			drag: {
				filterTaps: true,
				enabled: currentTool === 'fill',
				preventDefault: true,
			},
			pinch: {
				filterTaps: true,
				enabled: currentTool === 'fill',
				preventDefault: true,
			},
		}
	)

	// Manage canvas dimensions to be the same as the image dimensions when you change the current tool to erase or add
	useEffect(() => {
		if (currentTool === 'erase' || currentTool === 'add') {
			const imageAspectRatio =
				imageDimensions.width / imageDimensions.height

			setHistory([])
			setUndoHistory([])

			const workingAreaAspectRatio = window.innerWidth / workingHeight

			const mask = maskRef.current;
			const context = mask.getContext('2d');
			
			// Set some initial properties. You can change these as you like.
			context.strokeStyle = "#000000";
			context.lineWidth = 2;
		  
			// Save the initial state of the canvas to the history
			setHistory([context.getImageData(0, 0, mask.width, mask.height)]);

			// if image is wider than it is tall
			if (imageAspectRatio > 1) {
				canvasApi.start({
					width: window.innerWidth,
					height: window.innerWidth / imageAspectRatio,
					config: { duration: 100 },
				})
				setCanvasDimensions({
					width: window.innerWidth,
					height: window.innerWidth / imageAspectRatio,
				})
				api.start({
					width: window.innerWidth,
					height: window.innerWidth / imageAspectRatio,
					x: 0,
					y: 0,
					config: { duration: 100 },
				})
				setImgDimensions({
					width: window.innerWidth,
					height: window.innerWidth / imageAspectRatio,
				})
				mask.width = window.innerWidth;
				mask.height = window.innerWidth / imageAspectRatio;
			}
			// if image is a square
			if (imageAspectRatio === 1) {
				// set canvas width to window width
				canvasApi.start({
					width: window.innerWidth,
					height: window.innerWidth,
					config: { duration: 100 },
				})
				api.start({
					width: window.innerWidth,
					height: window.innerWidth,
					x: 0,
					y: 0,
					config: { duration: 100 },
				})

				setImgDimensions({
					width: window.innerWidth,
					height: window.innerWidth,
				})
				setCanvasDimensions({
					width: window.innerWidth,
					height: window.innerWidth,
				})
				mask.width = window.innerWidth;
				mask.height = window.innerWidth;
			}
			// if image is taller than it is wide
			if (imageAspectRatio < 1) {
				// if imageAspectRatio is taller than workingAreaAspectRatio then set canvas height to workingHeight and width to workingHeight * workingAreaAspectRatio
				if (imageAspectRatio > workingAreaAspectRatio) {
					canvasApi.start({
						width: window.innerWidth,
						height: window.innerWidth / imageAspectRatio,
						config: { duration: 100 },
					})
					api.start({
						width: window.innerWidth,
						height: window.innerWidth / imageAspectRatio,
						x: 0,
						y: 0,
						config: { duration: 100 },
					})
					setImgDimensions({
						width: window.innerWidth,
						height: window.innerWidth / imageAspectRatio,
					})
	
					setCanvasDimensions({
						width: window.innerWidth,
						height: window.innerWidth / imageAspectRatio,
					})
					mask.width = window.innerWidth;
					mask.height = window.innerWidth / imageAspectRatio;
				}

				// if imageAspectRatio is shorter than workingAreaAspectRatio then set canvas width to window width and height to window width / workingAreaAspectRatio
				if (imageAspectRatio < workingAreaAspectRatio) {
					canvasApi.start({
						width: workingHeight * imageAspectRatio,
						height: workingHeight,
						config: { duration: 100 },
					})
					api.start({
						width: workingHeight * imageAspectRatio,
						height: workingHeight,
						x: 0,
						y: 0,
						config: { duration: 100 },
					})
					setImgDimensions({
						width: workingHeight * imageAspectRatio,
						height: workingHeight,
					})
	
					setCanvasDimensions({
						width: workingHeight * imageAspectRatio,
						height: workingHeight,
					})
					mask.width = workingHeight * imageAspectRatio;
					mask.height = workingHeight;
				}
			}
			setCoordinates({
				x: 0,
				y: 0,
			})
		}
	}, [currentTool])



	// Manage image dimensions to adjust to the current aspect ratio and working height when you change the current tool to fill
	useEffect(() => {
		if (currentTool === 'fill') {
			let width = (ratioInfo.width / ratioInfo.height) * workingHeight
			let height = workingHeight
			setHistory([])
			setUndoHistory([])

			if (width > window.innerWidth) {
				width = window.innerWidth
				height = (ratioInfo.height / ratioInfo.width) * width
			}

			const imageAspectRatio =
				imageDimensions.width / imageDimensions.height
			const canvasAspectRatio = width / height

			if (imageAspectRatio > canvasAspectRatio) {
				// image is wider than canvas, so set width to canvas width
				api.start({
					width: width,
					height: width / imageAspectRatio,
					config: { duration: 100 },
				})

				setImgDimensions({
					width: width,
					height: width / imageAspectRatio,
				})
			} else {
				// image is taller than canvas, so set height to canvas height
				api.start({
					width: height * imageAspectRatio,
					height: height,
					config: { duration: 100 },
				})

				setImgDimensions({
					width: height * imageAspectRatio,
					height: height,
				})
			}

			canvasApi.start({ width, height, config: { duration: 100 } })
			setCanvasDimensions({ width, height })

			api.start({ x: 0, y: 0, delay: 100, config: { duration: 150 } })
			setCoordinates({ x: 0, y: 0 })
		}
	}, [aspectRatio, currentTool])

	useEffect(() => {
		const calcedData = {
			ratioHeight: ratioInfo.height,
			ratioWidth: ratioInfo.width,
			squareSize:
				ratioInfo.width > ratioInfo.height
					? canvasDimensions.height
					: canvasDimensions.width,
			canva: {
				width: canvasDimensions.width,
				height: canvasDimensions.height,
				topLeft: [0, 0],
				bottomRight: [canvasDimensions.width, canvasDimensions.height],
			},
			image: {
				width: imgDimensions.width,
				height: imgDimensions.height,
				topLeft: [
					coordinates.x < 0 ? 0 : coordinates.x,
					coordinates.y < 0 ? 0 : coordinates.y,
				],
				bottomRight: [
					coordinates.x + imgDimensions.width > canvasDimensions.width
						? canvasDimensions.width
						: coordinates.x + imgDimensions.width,

					coordinates.y + imgDimensions.height >
					canvasDimensions.height
						? canvasDimensions.height
						: coordinates.y + imgDimensions.height,
				],
			},
		}

		const event = new CustomEvent('canva-fill-data', {
			detail: {
				data: calcedData,
				imgRef: imgRef.current,
				canvaRef: canvasRef.current,
			},
		})

		document.dispatchEvent(event)
	})


	// masking and drawing management
	const startDrawing = (event) => {
		const canvas = maskRef.current;
		const context = canvas.getContext('2d');
	  
		context.fillStyle = "rgba(255, 0, 0, 0.5)";  // Semi-transparent red

		const rect = canvas.getBoundingClientRect();
		const x = event.touches[0].clientX - rect.left;
		const y = event.touches[0].clientY - rect.top;
		
		context.beginPath();
		context.arc(x, y, 5, 0, Math.PI * 2, true); // 5 is the radius of the circle
		context.fill();
		setIsDrawing(true);
	  }
	  
	  
	  const draw = (event) => {
		const canvas = maskRef.current;
		const context = canvas.getContext('2d');
	  
		context.fillStyle = "rgba(255, 0, 0, 0.6)";  // Semi-transparent red

		if (!isDrawing) return;
	  
		const rect = canvas.getBoundingClientRect();
		const x = event.touches[0].clientX - rect.left;
		const y = event.touches[0].clientY - rect.top;
		
		context.beginPath();
		context.arc(x, y, 8, 0, Math.PI * 2, true); // 5 is the radius of the circle
		context.fill();
	  }


	  const finishDrawing = () => {
		setIsDrawing(false);
	  
		// Save the current image data to the history array when finished drawing
		const canvas = maskRef.current
		const context = canvas.getContext('2d')
		setHistory([...history, context.getImageData(0, 0, canvas.width, canvas.height)]);
	  
		// Clear the redo history whenever a new action is performed
		setUndoHistory([]);
	  }

	useImperativeHandle(ref, () => ({
		restoreImage: (imageData) => {
		  try {
			const context = maskRef.current.getContext('2d');
			context.putImageData(imageData, 0, 0);
		  } catch (error) {
			console.error("Error restoring image data", error);
		  }
		}
	  }));


	// console.log(completedGenerations)
	return (
		<div
			style={{
				height: workingHeight,
				overflow: 'hidden',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<animated.div
				ref={canvasRef}
				style={{
					...styles.canvas,
					...canvasStyles,
					position: 'relative',
					touchAction: 'none',
					objectFit: 'contain',
				}}
				{...bind()}
			>
				{currentTool !== 'fill' && (
					<canvas
						ref={maskRef}
						style={{
							// ...canvasStyles,
							position: 'absolute',
							touchAction: 'none',
							left: 0,
							zIndex: 21,
						}}
						// width={canvasDimensions.width}
						// height={canvasDimensions.height}
						onTouchStart={startDrawing}
						onTouchEnd={finishDrawing}
						onTouchMove={draw}
					/>
				)}

				<animated.img
					ref={imgRef}
					style={{
						...styles.initialImg,
						...imgSpringStyle,
						zIndex: 20,
						left: 0,
						right: 0,
						position: 'absolute',
						touchAction: 'none',
					}}
					src={image}
					alt='sss'
				/>
			</animated.div>
		</div>
	)
})

export default Canvas
