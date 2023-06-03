import { useSpring, animated } from '@react-spring/web'
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react'
import { useEffect, useRef, useState } from 'react'

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

const Canvas = ({ aspectRatio, image, workingHeight, imageDimensions }) => {
	const [coordinates, setCoordinates] = useState({ x: 0, y: 0 })
	const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 })

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
				api.start({
					x: coordinates.x + x,
					y: coordinates.y + y,
					immediate: true,
				})
				if (!down && !dragging) {
					setCoordinates({
						x: coordinates.x + x,
						y: coordinates.y + y,
					})
				}
			},
			onPinch: ({ origin: [ox, oy], first, movement: [ms], offset: [s, a], memo, down, pinching }) => {
                if (first) {
                    const { width, height, x, y } = imgRef.current.getBoundingClientRect();
                    const tx = ox - (x + width / 2);
                    const ty = oy - (y + height / 2);
                    memo = [imgSpringStyle.x.get(), imgSpringStyle.y.get(), tx, ty, width, height];
                }
            
                const newWidth = imageDimensions.width * s;
                const newHeight = imageDimensions.height * s;

                console.log('newWidth', newWidth)
                console.log('newHeight', newHeight)
            
                const dx = (newWidth - memo[4]) / 2;
                const dy = (newHeight - memo[5]) / 2;
            
                const x = memo[0] - dx - (ms - 1) * memo[2];
                const y = memo[1] - dy - (ms - 1) * memo[3];
            
                api.start({
                    width: newWidth,
                    height: newHeight,
                    x: x,
                    y: y,
                    immediate: true,
                });


                if(!pinching) {
                    setCoordinates({
                        x: x,
                        y: y,
                    });

                    setImgDimensions({
                        width: newWidth,
                        height: newHeight,
                    });
                }
                
                return memo;
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

    console.log('coordinates', coordinates)
    console.log('imgDimensions', imgDimensions)
	useEffect(() => {
		const [widthRatio, heightRatio] = aspectRatioGenerator(aspectRatio)
			.split('/')
			.map(Number)

		let width = (widthRatio / heightRatio) * workingHeight
		let height = workingHeight

		if (width > window.innerWidth) {
			width = window.innerWidth
			height = (heightRatio / widthRatio) * width
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

		api.start({ x: 0, y: 0, delay: 100, config: { duration: 150 } })
		setCoordinates({ x: 0, y: 0 })
	}, [aspectRatio])


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
				<div
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
				</div>
			</animated.div>
		</div>
	)
}

export default Canvas
