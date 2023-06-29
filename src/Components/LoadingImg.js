import { loadingCaptions } from '../lib/loadingCaptions'
import SwipableViews from 'react-swipeable-views'

import { useEffect, useState } from 'react'

import GridImg from '../resources/grid.webp'

import './loadingImg.css'

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

const styles = {
	wrapper: {
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
		background: 'rgba(0,0,0,0.7)',
		flexDirection: 'column',
	},
	innerWrapper: {
		background: '#ffffff',
		boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.25)',
		borderRadius: '10px',
		backgroundImage:
			'url("https://www.transparenttextures.com/patterns/az-subtle.png")',
		zIndex: 30,
	},
	background: {
		width: '100%',
		height: '100%',
		background: 'rgba(0,0,0,0.4)',
		position: 'absolute',
		zIndex: 0,
		// filter: 'background-blur(30px)',
		backdropFilter: 'blur(30px)',
	},
	cancelButton: {
		height: 44,
		display: 'flex',
		justifyContent: 'center',
		paddingLeft: 20,
		paddingRight: 20,
		alignItems: 'center',
		marginTop: 40,
		color: '#ffffff',
		fontSize: 16,
		fontWeight: 600,
		textShadow: '0px 4px 8px rgba(0, 0, 0, 0.14)',
		background: 'rgba(0,0,0,0.4)',
		borderRadius: 10,
		zIndex: 12,
	},
	loadingBar: {
		width: window.innerWidth - 40,
		height: 10,
		background: 'rgba(255,255,255, 0.4)',
		borderRadius: 10,
		zIndex: 13,
		marginTop: 20,
		position: 'relative',
	},
	buttonGroup: {
		marginTop: 20,
		display: 'grid',
		gridTemplateColumns: '1fr 1fr',
		gridTemplateRows: '1fr 1fr',
		gridGap: 12,
		zIndex: 12,
		width: window.innerWidth - 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	button: {
		height: 50,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		background: '#F5F9FF',
		borderRadius: 10,
		color: '#2772ff',
		fontWeight: 600,
	},
	indexCircle: {
		height: 10,
		borderRadius: 10,
		marginLeft: 5,
		marginRight: 5,
	},
	indexCircles: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 20,
		zIndex: 12,
	},
}

const ManageGenerate = ({
	aspectRatio,
	loadingImages,
	onCancel,
	workingHeight,
	progress,
	isFinished,
	progressImageUrl,
	handleRunButton,
	loadingType,
	buttons,
	upscaleImage,
}) => {
	const [caption, setCaption] = useState('')
	const [animationClass, setAnimationClass] = useState('')
	const [index, setIndex] = useState(0)

	console.log(loadingImages)

	const decideDimensions = () => {
		const ratioInfo = aspectRatioGenerator(aspectRatio)
		let width = (ratioInfo.width / ratioInfo.height) * workingHeight
		let height = workingHeight

		if (width > window.innerWidth) {
			width = window.innerWidth
			height = (ratioInfo.height / ratioInfo.width) * width
		}

		return {
			width: width,
			height: height,
		}
	}

	useEffect(() => {
		if (isFinished) {
			return
		}

		setCaption(
			loadingCaptions[Math.floor(Math.random() * loadingCaptions.length)]
		)
		setAnimationClass('fade-in')
		const interval = setInterval(() => {
			setAnimationClass('fade-out')
			setTimeout(() => {
				setCaption(
					loadingCaptions[
						Math.floor(Math.random() * loadingCaptions.length)
					]
				)
				setAnimationClass('fade-in')
			}, 1000) // Change caption after old one fades out
		}, 3000) // Change caption every 4 seconds to allow for fade out
		return () => clearInterval(interval)
	}, [isFinished])

	const imageAmounts = loadingImages.length

	const claculateGridImg = (index) => {
		if (index === 0) {
			return 'scale(2) translate(0%, 25%)'
		}

		if (index === 1) {
			return 'scale(2) translate(-50%, 25%)'
		}
		if (index === 2) {
			return 'scale(2) translate(0%, -25%)'
		}
		if (index === 3) {
			return 'scale(2) translate(-50%, -25%)'
		}
	}

	const decideImage = (img) => {
		if (loadingType === 'upscale') {
			console.log(upscaleImage)
			return upscaleImage
		}
		if (isFinished) return img
		if (progressImageUrl.length > 0) return progressImageUrl
	}

	console.log(loadingType)
	return (
		<div style={styles.wrapper}>
			{loadingType === 'upscale' ? (
				<div
					key={index}
					style={{
						...styles.innerWrapper,
						...decideDimensions(),
						aspectRatio: `${
							aspectRatioGenerator(aspectRatio).ratio
						}`,
						position: 'relative',
						overflow: 'hidden',
						margin: '0px auto',
					}}
				>
					{isFinished || progressImageUrl.length > 0 ? (
						<img
							src={upscaleImage}
							alt='Loading'
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								width: '100%',
								height: '100%',
							}}
						/>
					) : null}
				</div>
			) : (
				<SwipableViews
					index={index}
					onChangeIndex={(index) => setIndex(index)}
					style={{
						width: window.innerWidth,
						height: workingHeight,
						zIndex: 10,
					}}
				>
					{loadingImages.map((image, index) => {
						return (
							<div
								key={index}
								style={{
									...styles.innerWrapper,
									...decideDimensions(),
									aspectRatio: `${
										aspectRatioGenerator(aspectRatio).ratio
									}`,
									position: 'relative',
									overflow: 'hidden',
									margin: '0px auto',
								}}
							>
								{isFinished || progressImageUrl.length > 0 ? (
									<img
										src={decideImage(image)}
										alt='Loading'
										style={{
											position: 'absolute',
											transform: isFinished
												? 'translate(-50%, 0)'
												: claculateGridImg(index),
											transition: 'all 0.3s ease',
											width: '100%',
											height: '100%',
										}}
									/>
								) : null}
							</div>
						)
					})}
				</SwipableViews>
			)}

			{loadingType === 'upscale' ? null : (
				<div style={styles.indexCircles}>
					{/* create an empty array with the length of the images */}
					{[...Array(imageAmounts)].map((_, i) => {
						return (
							<div
								style={{
									...styles.indexCircle,
									width: i === index ? 20 : 10,
									background:
										i === index
											? 'rgba(39, 114, 255, 1)'
											: 'rgba(255,255,255,0.4)',
									transition: 'all 0.3s ease',
								}}
							/>
						)
					})}
				</div>
			)}

			{isFinished ? (
				loadingType === 'upscale' ? (
					<div style={styles.buttonGroup}>
						{buttons.map((button) => (

						<div
							style={styles.button}
							onClick={() =>
								handleRunButton(
									index,
									'variant',
									button
								)
							}
						>
							{button}
						</div>
						))
						}
					</div>
				) : (
					<div style={styles.buttonGroup}>
						<div
							style={styles.button}
							onClick={() => console.log('save image', index)}
						>
							{' '}
							Save{' '}
						</div>
						<div
							style={styles.button}
							onClick={() =>
								handleRunButton(
									index,
									'variant',
									`V${index + 1}`
								)
							}
						>
							{' '}
							Variant{' '}
						</div>
						<div
							style={styles.button}
							onClick={() =>
								handleRunButton(
									index,
									'upscale',
									`U${index + 1}`
								)
							}
						>
							{' '}
							Upscale{' '}
						</div>
					</div>
				)
			) : (
				<>
					<div style={styles.animationWrapper}>
						<div style={styles.loadingBar}>
							<div
								style={{
									...styles.innerLoadingBar,
									width: `${progress}%`,
									height: 10,
									borderRadius: 10,
									position: 'absolute',
									top: 0,
									left: 0,
									background: '#ffffff',
									transition: 'width 0.5s ease-in-out',
								}}
							/>
						</div>
					</div>
					<div
						style={{
							height: 20,
							marginTop: 40,
							color: '#ffffff',
							fontSize: 16,
							fontWeight: 600,
							textShadow: '0px 4px 8px rgba(0, 0, 0, 0.14)',
							zIndex: 12,
						}}
						className={`${animationClass}`}
					>
						{caption}
					</div>
					<div onClick={onCancel} style={styles.cancelButton}>
						Cancel
					</div>
				</>
			)}
			<div style={styles.background} />
		</div>
	)
}

export default ManageGenerate
