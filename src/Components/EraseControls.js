import ArrowLeft from '../resources/arrowLeft'
import ArrowRight from '../resources/arrowRight'
import MaskIcon from '../resources/mask'
import BackgroundIcon from '../resources/background'

const styles = {
	wrapper: {
		display: 'flex',
		justifyContent: 'space-between',
		height: 80,
		background: '#fff',
		borderBottom: '1px solid #E5E5E5',
		borderTop: '1px solid #E5E5E5',
		paddingLeft: 16,
		paddingRight: 16,
		alignItems: 'stretch',
	},
	historyControls: {
		width: '25vw',
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	buttonWrapper: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100%',
		width: 56,
	},
	label: {
		fontSize: 12,
		fontWeight: 600,
		marginTop: 4,
	},
	modeControl: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
}

const EraseControls = ({ undo, setEraseMode, eraseMode, isVisible, hasUndo}) => {
	if (!isVisible) {
		return null
	}
	return (
		<div style={styles.wrapper}>
			<div style={styles.historyControls}>
				<div onClick={undo}>
					<ArrowLeft
                        color={hasUndo ? '#111' : '#ccc'}
                    />
				</div>
			</div>
			<div style={styles.modeControl}>
				<div
					style={styles.buttonWrapper}
					onClick={() => setEraseMode('mask')}
				>
					<MaskIcon
						color={eraseMode === 'mask' ? '#277ff2' : '#A8B0C0'}
					/>
					<div
						style={{
							...styles.label,
							color: eraseMode === 'mask' ? '#277ff2' : '#A8B0C0',
						}}
					>
						Mask
					</div>
				</div>
				<div style={{ width: 24 }} />
				<div
					style={styles.buttonWrapper}
					onClick={() => setEraseMode('background')}
				>
					<BackgroundIcon
						color={
							eraseMode === 'background' ? '#277ff2' : '#A8B0C0'
						}
					/>
					<div
						style={{
							...styles.label,
							color:
								eraseMode === 'background'
									? '#277ff2'
									: '#A8B0C0',
						}}
					>
						BG Erase
					</div>
				</div>
			</div>
			<div style={{ width: '25vw' }} />
		</div>
	)
}

export default EraseControls
