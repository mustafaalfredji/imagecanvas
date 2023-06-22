import ArrowLeft from '../resources/arrowLeft'
import ArrowRight from '../resources/arrowRight'
import MaskIcon from '../resources/mask'
import BackgroundIcon from '../resources/background'

import { useEffect } from 'react'

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

const AddControls = ({ undo, setSubmode, subMode, isVisible, hasUndo}) => {
	useEffect(() => {
		if (subMode !== 'mask') {
			setSubmode('mask');
		}
	}, [subMode]);

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
				>
					<MaskIcon
						color={'#277ff2'}
					/>
					<div
						style={{
							...styles.label,
							color:'#277ff2',
						}}
					>
						Mask
					</div>
				</div>
			</div>
			<div style={{ width: '25vw' }} />
		</div>
	)
}

export default AddControls
