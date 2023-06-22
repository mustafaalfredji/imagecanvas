import { useSpring, animated } from '@react-spring/web'
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react'
import {
	forwardRef,
	useEffect,
	useRef,
	useState,
	useImperativeHandle,
} from 'react'

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
	const {
		aspectRatio,
		image,
		workingHeight,
		imageDimensions,
		squares,
		currentTool,
		eraseMode,
		setHistory,
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
			},
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

			const workingAreaAspectRatio = window.innerWidth / workingHeight

			const mask = maskRef.current
			const context = mask.getContext('2d')

			// Set some initial properties. You can change these as you like.
			context.strokeStyle = '#000000'
			context.lineWidth = 2

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
				mask.width = window.innerWidth
				mask.height = window.innerWidth / imageAspectRatio
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
				mask.width = window.innerWidth
				mask.height = window.innerWidth
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
					mask.width = window.innerWidth
					mask.height = window.innerWidth / imageAspectRatio
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
					mask.width = workingHeight * imageAspectRatio
					mask.height = workingHeight
				}
			}
			setCoordinates({
				x: 0,
				y: 0,
			})
			setHistory([])
		}
	}, [currentTool])

	// Manage image dimensions to adjust to the current aspect ratio and working height when you change the current tool to fill
	useEffect(() => {
		if (currentTool === 'fill') {
			let width = (ratioInfo.width / ratioInfo.height) * workingHeight
			let height = workingHeight

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
		const canvas = maskRef.current
		const context = canvas.getContext('2d')

		context.fillStyle = 'rgba(255, 0, 0, 0.5)' // Semi-transparent red

		const rect = canvas.getBoundingClientRect()
		const x = event.touches[0].clientX - rect.left
		const y = event.touches[0].clientY - rect.top

		context.beginPath()
		context.arc(x, y, 8, 0, Math.PI * 2, true) // 5 is the radius of the circle
		context.fill()
		setIsDrawing(true)
	}

	const draw = (event) => {
		const canvas = maskRef.current
		const context = canvas.getContext('2d')

		context.fillStyle = 'rgba(255, 0, 0, 0.6)' // Semi-transparent red

		if (!isDrawing) return

		const rect = canvas.getBoundingClientRect()
		const x = event.touches[0].clientX - rect.left
		const y = event.touches[0].clientY - rect.top

		context.beginPath()
		context.arc(x, y, 8, 0, Math.PI * 2, true) // 5 is the radius of the circle
		context.fill()
	}

	const finishDrawing = () => {
		setIsDrawing(false)
		setHistory([''])
	}

	useImperativeHandle(ref, () => ({
		restoreImage: () => {
			try {
				const context = maskRef.current.getContext('2d')
				// create an empty imageData object
				const newImageData = context.createImageData(
					maskRef.current.width,
					maskRef.current.height
				)

				context.putImageData(newImageData, 0, 0)
				setHistory([])
			} catch (error) {
				console.error('Error restoring image data', error)
			}
		},
		exportCanvas: () => {
			console.log('exporting canvas')

			const originalCanvas = maskRef.current
			const originalContext = originalCanvas.getContext('2d')

			// Get the image data from the original canvas
			const originalImageData = originalContext.getImageData(
				0,
				0,
				originalCanvas.width,
				originalCanvas.height
			)
			const originalData = originalImageData.data

			// Create a temporary canvas and fill it with black
			const tempCanvas = document.createElement('canvas')
			tempCanvas.width = originalCanvas.width
			tempCanvas.height = originalCanvas.height
			const tempContext = tempCanvas.getContext('2d')
			tempContext.fillStyle = 'black'
			tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height)

			// Get the image data from the temporary canvas
			const tempImageData = tempContext.getImageData(
				0,
				0,
				tempCanvas.width,
				tempCanvas.height
			)
			const tempData = tempImageData.data

			// Loop over each pixel in the original image data
			for (let i = 0; i < originalData.length; i += 4) {
				if (originalData[i + 3] !== 0) {
					// If the pixel is not transparent (it's part of a drawing), make the corresponding pixel white in the temporary canvas
					tempData[i] = 255
					tempData[i + 1] = 255
					tempData[i + 2] = 255
					tempData[i + 3] = 255

				}
			}

			// Put the modified image data back into the temporary canvas
			tempContext.putImageData(tempImageData, 0, 0)

			// Export the temporary canvas
			const imageUrl = tempCanvas.toDataURL('image/png')
			const link = document.createElement('a')
			link.href = imageUrl
			link.download = 'canvas.png'
			link.click()

			// export image from animated.img with the ref imgRef
			const img = imgRef.current
			const imgCanvas = document.createElement('canvas')
			imgCanvas.width = canvasDimensions.width
			imgCanvas.height = canvasDimensions.height
			const imgContext = imgCanvas.getContext('2d')
			imgContext.drawImage(img, 0, 0, imgCanvas.width, imgCanvas.height);
			const imgData = imgCanvas.toDataURL('image/png')
			const imgLink = document.createElement('a')
			imgLink.href = imgData
			imgLink.download = 'image.png'
			imgLink.click()
		},
	}))

	const showCanvas = currentTool !== 'fill'
	const shouldDraw = eraseMode === 'mask'
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
				{showCanvas && (
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
						onTouchStart={shouldDraw ? startDrawing : null}
						onTouchEnd={shouldDraw ? finishDrawing : null}
						onTouchMove={shouldDraw ? draw : null}
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
