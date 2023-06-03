import { useSpring, animated } from '@react-spring/web'
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react'
import { useEffect, useRef, useState } from 'react'

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

const Canvas = ({ aspectRatio, image, workingHeight, imageDimensions }) => {
	const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })
	const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 })
	const [canvasDimensions, setCanvasDimensions] = useState({
		width: 0,
		height: 0,
	})
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
	}))

	const canvasRef = useRef(null)
	const imgRef = useRef(null)

	const useGesture = createUseGesture([dragAction, pinchAction])

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
			},
		},
		{
			drag: {
				filterTaps: true,
				enabled: true,
				preventDefault: true,
			},
			pinch: {
				filterTaps: true,
				enabled: true,
				preventDefault: true,
			},
		}
	)

	useEffect(() => {

		let width = (ratioInfo.width / ratioInfo.height) * workingHeight
		let height = workingHeight

		if (width > window.innerWidth) {
			width = window.innerWidth
			height = (ratioInfo.height / ratioInfo.width) * width
		}

		const imageAspectRatio = imageDimensions.width / imageDimensions.height
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
	}, [aspectRatio])

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

					coordinates.y + imgDimensions.height > canvasDimensions.height
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
				}}
				// bind only if imgRef is defined
				{...bind()}
			>
				<animated.img
					ref={imgRef}
					style={{
						...styles.initialImg,
						...imgSpringStyle,
						zIndex: 10,
						left: 0,
						right: 0,
						position: 'absolute',
						touchAction: 'none',
					}}
					src={image}
					alt='sss'
				/>
				{/* <div
					style={{
						position: 'absolute',
						top: 24,
						right: 24,
						zIndex: 20,
						background: 'rgba(255,255,255,0.5)',
						padding: 10,
						borderRadius: 10,
					}}
				>
					x: {coordinates.x.toFixed(0)}, y: {coordinates.y.toFixed(0)}
				</div>

				<div
					style={{
						position: 'absolute',
						top: 24,
						left: 24,
						zIndex: 20,
						background: 'rgba(255,255,255,0.5)',
						padding: 10,
						borderRadius: 10,
					}}
				>
					Width: {imgDimensions.width.toFixed(0)}, Height:{' '}
					{imgDimensions.height.toFixed(0)}
				</div> */}
				{/* <div
					style={{
						position: 'absolute',
						bottom: 24,
						left: 24,
						zIndex: 20,
						background: 'rgba(255,255,255,0.5)',
						padding: 10,
						borderRadius: 10,
					}}
				>
					Canvas Width: {canvasDimensions.width}, height:{' '}
					{canvasDimensions.height}
				</div> */}
			</animated.div>
		</div>
	)
}

export default Canvas
