import { useEffect, useState } from 'react'

const styles = {
	wrapper: {
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '80px',
	},
	inputWrapper: {
		display: 'flex',
		justifyContent: 'center',
		width: 'calc(100% - 48px)',
		border: '1px solid #E5E5E5',
		borderRadius: '40px',
		overflow: 'hidden',
		height: 48,
	},
	input: {
		width: '100%',
		borderTopLeftRadius: '40px',
		borderBottomLeftRadius: '40px',
		paddingLeft: '20px',
		border: 'none',
	},
	button: {
		background:
			'linear-gradient(275.12deg, #04ECFD -46.59%, #2772FF 109.3%)',
		border: 'none',
		borderRadius: '0px 10px 10px 0px',
		color: '#ffffff',
		fontSize: '16px',
		fontWeight: 'bold',
		padding: '10px 24px',
		width: '61.8%',
	},
}

const PromptBox = ({
	textPrompt,
	setTextPrompt,
	generate,
	generationText,
	isVisible,
	isOptional,
    placeholder,
	isActive,
}) => {
	const [canvaFillData, setCanvaFillData] = useState(null)

	const handleFillData = (e) => {
		setCanvaFillData(e.detail)
	}
	useEffect(() => {
		document.addEventListener('canva-fill-data', handleFillData, false)

		return () => {
			document.removeEventListener(
				'canva-fill-data',
				handleFillData,
				false
			)
		}
	}, [])

	if (!isVisible) {
		return null
	}

	return (
		<div style={styles.wrapper}>
			<div
				style={{
					...styles.inputWrapper,
					opacity: isActive ? 1 : 0.5,
                    transition: 'opacity 0.2s ease-in-out',
				}}
			>
				<input
					style={styles.input}
					type='text'
					value={textPrompt}
					disabled={!isActive}
					placeholder={placeholder}
					onChange={(e) => setTextPrompt(e.target.value)}
				/>
				<button
					disabled={!isActive}
					style={styles.button}
					onClick={() => generate(canvaFillData)}
				>
					{generationText}
				</button>
			</div>
		</div>
	)
}

export default PromptBox
