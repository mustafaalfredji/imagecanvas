import Lottie from 'lottie-react'
import loadingAnimation from '../lottiefiles/scanner.json'

import { loadingCaptions } from '../lib/loadingCaptions'

import { useEffect, useState } from 'react'

import './loadingImg.css'

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
		width: 'calc(100% - 48px)',
		boxShadow: '0px 0px 30px rgba(0, 0, 0, 0.25)',
		borderRadius: '10px',
        zIndex: 12,
	},
    background: {
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.4)',
        position: 'absolute',
        zIndex: 0,
        // filter: 'background-blur(30px)',
        backdropFilter: 'blur(30px)',
    }
}

const LoadigImg = ({ aspectRatio, img }) => {
	const [caption, setCaption] = useState('')
	const [animationClass, setAnimationClass] = useState('')

	const aspectRatioSelector = () => {
		switch (aspectRatio) {
			case 0:
				return '9/16'
			case 1:
				return '3/4'
			case 2:
				return '1/1'
			case 3:
				return '4/3'
			case 4:
				return '16/9'
			default:
				return '9/16'
		}
	}

	useEffect(() => {
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
	}, [])

	return (
		<div style={styles.wrapper}>
			<div
				style={{
					...styles.innerWrapper,
					aspectRatio: `${aspectRatioSelector()}`,
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				<Lottie
					height={window.innerHeight}
					animationData={loadingAnimation}
					loop={true}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						transform: aspectRatio === 2 ? 'scale(1)' : 'scale(2)',
						height: '100%',
						zIndex: 10,
					}}
				/>
				<img
					src={img}
					alt='sss'
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
					}}
				/>
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
            <div style={styles.background}/>
		</div>
	)
}

export default LoadigImg
