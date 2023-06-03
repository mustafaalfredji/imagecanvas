import { useSpring, animated } from '@react-spring/web'
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react'
import { useEffect, useRef, useState } from 'react'
import html2canvas from 'html2canvas'

// import imgSrc from '../images/profilepic.jpg'
import imgSrc from '../images/2.jpg'
// import imgSrc from '../images/ali2.JPG'
// import widePhoto from '../images/widePhoto.jpg'
import {
	getUpperTransparent,
	getLowerTransparent,
	storeAndFill,
	fillImage,
} from '../requests/getImage'

import './canvas.css'
import { styles } from './styles'

const aspectRatioGenerator = (index) => {
	if (index === 0) {
		return '9/16'
	}
	if (index === 1) {
		return '3/4'
	}
	if (index === 2) {
		return '1/1'
	}
	if (index === 3) {
		return '4/3'
	}
	if (index === 4) {
		return '16/9'
	}
}

const Canvas = ({ aspectRatio, image, workingHeight }) => {
	const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })
	const [completedGenerations, setCompletedGenerations] = useState([])
	const [generationFrames, setGenerationFrames] = useState([])
	const [imageLoading, setImageLoading] = useState(false)
	const [imgDimensions, setImgDimensions] = useState({ height: 0, width: 0 }) // State for the image dimensions

	// set the image width to be the height of the canvas
	const [{ x, y, height, width }, api] = useSpring(() => ({
		x: 0,
		y: 0,
		height: 0,
		width: 0,
	}))

	const ref = useRef(null)
	const canvasRef = useRef(null)
	const imgRef = useRef(null)

	const handleImgLoad = () => {
		if (imgRef.current) {
			setImgDimensions({
				height: imgRef.current.clientHeight,
				width: imgRef.current.clientWidth,
			})
		}
	}

	useEffect(() => {
		if (imgRef.current && imgRef.current.complete) {
			handleImgLoad() // Image was already loaded, manually trigger the load event
		}
	}, []) // Run once on mount

	const useGesture = createUseGesture([dragAction, pinchAction])

	const bind = useGesture(
		{
			onDrag: ({ down, offset: [mx, my] }) => {
				api.start({ x: mx, y: my, immediate: down })
				if (!down) {
					setCoordinates({ x: mx, y: my })
				}
			},
			// onPinchStart: (state) => doSomethingWith(state),
			// onPinchEnd: (state) => doSomethingWith(state)
		},
		{
			drag: {
				axis: 'lock',
				filterTaps: true,
				bounds: canvasRef,
				preventDefault: true,
			},
		}
	)

	console.log(coordinates)

	const capture = async (y) => {
		const element = canvasRef.current
		const imgHeight = ref.current.clientHeight
		const imgWidth = ref.current.clientWidth

		const canvasWidth = element.clientWidth
		const canvasHeight = element.clientHeight

		let imageDataUrl = null

		await html2canvas(element, {
			backgroundColor: null,
			y: y,
			logging: true,
			width: canvasWidth,
			height: canvasWidth,
			scale: 1024 / canvasWidth,
		}).then((canvas) => {
			// get the image data
			imageDataUrl = canvas.toDataURL('image/png')

			return imageDataUrl
		})

		return imageDataUrl
	}

	const captureAndDownload = async (y) => {
		const element = canvasRef.current
		const imgHeight = ref.current.clientHeight
		const imgWidth = ref.current.clientWidth

		const canvasWidth = element.clientWidth
		const canvasHeight = element.clientHeight

		let imageDataUrl = null

		await html2canvas(element, {
			backgroundColor: null,
			y: y,
			logging: true,
			width: canvasWidth,
			height: canvasWidth,
			scale: 1024 / canvasWidth,
		}).then((canvas) => {
			// create an 'a' element to download the image
			const a = document.createElement('a')

			// get the image data
			const image = canvas.toDataURL('image/png')

			// set the href and download attributes for the a element
			a.href = image
			a.download = 'canvas-image.png'

			// append the a element to the body and click it to download the image
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
		})

		return imageDataUrl
	}

	const randomColor = () => {
		const r = Math.floor(Math.random() * 256)
		const g = Math.floor(Math.random() * 256)
		const b = Math.floor(Math.random() * 256)
		return `rgb(${r},${g},${b})`
	}

	const generate = async (list, direction) => {
		// direction 0 is down, 1 is up
		let preImg = null
		for (let i = 0; i < list.length; i++) {
			const item = list[i]

			if (i === 0) {
				const imageData = await capture(item.yStart)
				const image = await storeAndFill(imageData, item.yStart)
				console.log(image)
				setCompletedGenerations((prev) => {
					return [
						...prev,
						{
							name: item.name,
							src: image,
							zIndex: 9 - completedGenerations.length,
							yStart: item.yStart,
							height: item.height,
						},
					]
				})
				preImg = image
			}

			if (i === 1) {
				const transparentImage =
					direction === 1
						? await getUpperTransparent(preImg, item.yStart)
						: await getLowerTransparent(preImg, item.yStart)

				const image = await fillImage(transparentImage, item.yStart)
				setCompletedGenerations((prev) => {
					return [
						...prev,
						{
							name: item.name,
							src: image,
							zIndex: 9 - completedGenerations.length,
							yStart: item.yStart,
							height: item.height,
						},
					]
				})
				preImg = image
			}
		}
	}

	const createGenerationFrames2 = () => {
		const element = canvasRef.current
		const imgHeight = ref.current.clientHeight

		const canvasWidth = element.clientWidth
		const canvasHeight = element.clientHeight

		const yImageStart = coordinates.y
		const yImageEnd = coordinates.y + imgHeight

		const yImageMiddle = yImageStart + imgHeight / 2

		// Calculate the number of squares needed to fill the canvas, the squares can be overlapping
		const squareDim = canvasWidth
		const squareCount = Math.ceil(canvasHeight / (squareDim * 0.6)) // Here is the update.

		console.log(squareCount)
		// console.log(squareList)
		// setGenerationFrames(squareList)
	}

	const createGenerationFrames = () => {
		const element = canvasRef.current
		const imgHeight = ref.current.clientHeight

		const canvasWidth = element.clientWidth
		const canvasHeight = element.clientHeight

		const yMin = 0
		const yMax = canvasHeight
		const yImageStart = coordinates.y
		const yImageEnd = coordinates.y + imgHeight
		const emptyUpperHeight = coordinates.y
		const emptyLowerHeight = canvasHeight - (coordinates.y + imgHeight)
		const emptyUpperYStart = 0
		const emptyUpperYEnd = coordinates.y
		const emptyLowerYStart = coordinates.y + imgHeight
		const emptyLowerYEnd = canvasHeight
		const squareDim = canvasWidth

		console.log(emptyLowerHeight)
		const captureLower = () => {
			if (emptyLowerHeight <= 0) return []

			// if height is lower than half squareDim, then capture one
			if (emptyLowerHeight < squareDim / 2) {
				return [
					{
						yStart: canvasHeight - squareDim,
						yEnd: canvasHeight,
						height: squareDim,
						name: `canvas-image-${canvasHeight - squareDim}.png`,
						immediate: true,
					},
				]
			}

			// if height is higher than half squareDim, then capture 2
			if (emptyLowerHeight > squareDim / 2) {
				return [
					{
						yStart: yImageEnd - squareDim / 2,
						yEnd: yImageEnd + squareDim / 2,
						height: squareDim,
						name: `canvas-image-${yImageEnd - squareDim / 2}.png`,
						immediate: true,
					},
					{
						yStart: canvasHeight - squareDim,
						yEnd: canvasHeight,
						height: squareDim,
						name: `canvas-image-${canvasHeight - squareDim}.png`,
						immediate: false,
					},
				]
			}
		}

		const captureUpper = () => {
			// no height, skip
			if (emptyUpperHeight === 0) return []

			// if height is lower than half squareDim, then capture one
			if (emptyUpperHeight < squareDim / 2) {
				return [
					{
						yStart: 0,
						yEnd: squareDim,
						height: squareDim,
						name: `canvas-image-${0}.png`,
						immediate: true,
					},
				]
			}

			// if height is higher than half squareDim, then capture 2
			if (emptyUpperHeight > squareDim / 2) {
				return [
					{
						yStart: yImageStart - squareDim / 2,
						yEnd: yImageStart + squareDim / 2,
						height: squareDim,
						name: `canvas-image-${yImageStart}.png`,
						immediate: true,
					},
					{
						yStart: 0,
						yEnd: squareDim,
						height: squareDim,
						name: `canvas-image-${0}.png`,
						immediate: false,
					},
				]
			}
		}

		generate(captureLower(), 0)
		generate(captureUpper(), 1)

		// const captures = [
		//     captureUpper(),
		//     captureLower(),
		// ]

		// filter immediate captures
		// const immediateCaptures = captures.filter((item) => item.immediate)

		// filter non immediate captures
		// const nonImmediateCaptures = captures.filter((item) => !item.immediate)

		// console.log({
		//     imidiate: immediateCaptures,
		//     nonImmediate: nonImmediateCaptures,
		// })
		// setActiveGenerations(immediateCaptures)

		// setGenerationQueue(nonImmediateCaptures)
		// return captures
	}

	const exportImage = () => {
		const element = canvasRef.current
		const imgHeight = ref.current.clientHeight

		const canvasWidth = element.clientWidth
		const canvasHeight = element.clientHeight

		html2canvas(element, {
			backgroundColor: null,
			logging: true,
			width: canvasWidth,
			height: canvasHeight,
			scale: 1024 / canvasWidth,
		}).then((canvas) => {
			// create an 'a' element to download the image
			const a = document.createElement('a')

			// get the image data
			const image = canvas.toDataURL('image/png')

			// set the href and download attributes for the a element
			a.href = image
			a.download = 'canvas-image.png'

			// append the a element to the body and click it to download the image
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
		})
	}

	// console.log(completedGenerations)
	return (
		<div style={{
            height: workingHeight,
            overflow: 'hidden',
        }}>
			<div
				ref={canvasRef}
				style={{
					...styles.canvas,
					aspectRatio: aspectRatioGenerator(aspectRatio),
					position: 'relative',
                    height: workingHeight - 100,
				}}
			>
				<animated.img
					{...bind()}
					ref={ref}
					style={{
						...styles.initialImg,
						zIndex: 10,
						x,
						y,
						touchAction: 'none',
						position: 'absolute',
					}}
					src={image}
					alt='sss'
				/>

				{generationFrames.map((frame, index) => (
					<div
						key={index}
						className='isometric-square'
						style={{
							zIndex: frame.zIndex,
							position: 'absolute',
							top: frame.yStart,
							height: frame.height,
							width: '100%',
							background: frame.background,
						}}
					/>
				))}
				{completedGenerations.map((frame, index) => (
					<img
						key={index}
						alt={`canvas-${frame.y}`}
						src={frame.src}
						style={{
							zIndex: frame.zIndex,
							position: 'absolute',
							top: frame.yStart,
							height: frame.height,
							width: '100%',
							display: 'flex',
							opacity: frame.immediate ? 1 : 0.5,
							background: frame.background,
						}}
					/>
				))}
			</div>
			<div style={{ height: 40 }} />
			{/* <button onClick={() => captureAndDownload(coordinates.y)}>Capture image</button>
            <button onClick={exportImage}>Export image</button> */}
			<button onClick={createGenerationFrames}>
				Create generation frames
			</button>
			<button onClick={createGenerationFrames2}>
				Create mock generations
			</button>
		</div>
	)
}

export default Canvas
