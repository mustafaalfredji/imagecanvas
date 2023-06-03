const styles = {
	wrapper: {
		display: 'flex',
		justifyContent: 'space-evenly',
		height: 80,
		background: '#fff',
		borderBottom: '1px solid #E5E5E5',
		borderTop: '1px solid #E5E5E5',
		paddingLeft: 16,
		paddingRight: 16,
		alignItems: 'flex-end',
	},
	buttonWrapper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		paddingBottom: 8,
	},
	label: {
		fontSize: 12,
		fontWeight: 600,
		marginTop: 4,
	},
}

const FillControls = ({ currentCanvas, setCurrentCanvas, isVisible }) => {
	if (!isVisible) {
		return null
	}
	return (
		<div style={styles.wrapper}>
			<div style={styles.buttonWrapper}>
				<div
					style={{
						width: 24,
						aspectRatio: '9/16',
						border:
							currentCanvas === 0
								? '1px solid #2772FF'
								: '1px solid #A8B0C0',
					}}
					onClick={() => setCurrentCanvas(0)}
				/>
				<span
					style={{
						...styles.label,
						color: currentCanvas === 0 ? '#2772FF' : '#A8B0C0',
					}}
				>
					9:16
				</span>
			</div>
			<div style={styles.buttonWrapper}>
				<div
					style={{
						width: 24,
						aspectRatio: '3/4',
						border:
							currentCanvas === 1
								? '1px solid #2772FF'
								: '1px solid #A8B0C0',
					}}
					onClick={() => setCurrentCanvas(1)}
				/>
				<span
					style={{
						...styles.label,
						color: currentCanvas === 1 ? '#2772FF' : '#A8B0C0',
					}}
				>
					3:4
				</span>
			</div>
			<div style={styles.buttonWrapper}>
				<div
					style={{
						width: 24,
						aspectRatio: '1/1',
						border:
							currentCanvas === 2
								? '1px solid #2772FF'
								: '1px solid #A8B0C0',
					}}
					onClick={() => setCurrentCanvas(2)}
				/>
				<span
					style={{
						...styles.label,
						color: currentCanvas === 2 ? '#2772FF' : '#A8B0C0',
					}}
				>
					1:1
				</span>
			</div>
			<div style={styles.buttonWrapper}>
				<div
					style={{
						width: 24,
						aspectRatio: '4/3',
						border:
							currentCanvas === 3
								? '1px solid #2772FF'
								: '1px solid #A8B0C0',
					}}
					onClick={() => setCurrentCanvas(3)}
				/>
				<span
					style={{
						...styles.label,
						color: currentCanvas === 3 ? '#2772FF' : '#A8B0C0',
					}}
				>
					4:3
				</span>
			</div>
			<div style={styles.buttonWrapper}>
				<div
					style={{
						width: 24,
						aspectRatio: '16/9',
						border:
							currentCanvas === 4
								? '1px solid #2772FF'
								: '1px solid #A8B0C0',
					}}
					onClick={() => setCurrentCanvas(4)}
				/>
				<span
					style={{
						...styles.label,
						color: currentCanvas === 4 ? '#2772FF' : '#A8B0C0',
					}}
				>
					16:9
				</span>
			</div>
		</div>
	)
}

export default FillControls
