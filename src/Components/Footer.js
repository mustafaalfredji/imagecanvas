import FillIcon from '../resources/fill.js'
import RemoveIcon from '../resources/remove.js'
import AddIcon from '../resources/add.js'

const styles = {
	wrapper: {
		background: '#fff',
		height: 80,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-evenly',
		borderTop: '1px solid #E5E5E5',
	},
	footerItem: {
		height: 80,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: '#2772FF',
		fontSize: 16,
		fontWeight: 600,
		cursor: 'pointer',
		width: '20%',
	},
}

const Footer = ({ currentTool, setCurrentTool }) => {
	return (
		<div style={styles.wrapper}>
			<div
				onClick={() => setCurrentTool('fill')}
				style={{
					...styles.footerItem,
					color: currentTool === 'fill' ? '#2772FF' : '#A8B0C0',
				}}
			>
				<FillIcon
					color={currentTool === 'fill' ? '#2772FF' : '#A8B0C0'}
				/>
				<span style={{ marginLeft: 8 }}>Fill</span>
			</div>

			<div
				onClick={() => setCurrentTool('erase')}
				style={{
					...styles.footerItem,
					color: currentTool === 'erase' ? '#2772FF' : '#A8B0C0',
				}}
			>
				<RemoveIcon
					color={currentTool === 'erase' ? '#2772FF' : '#A8B0C0'}
				/>
				<span style={{ marginLeft: 8 }}>Erase</span>
			</div>

			<div
				onClick={() => setCurrentTool('add')}
				style={{
					...styles.footerItem,
					color: currentTool === 'add' ? '#2772FF' : '#A8B0C0',
				}}
			>
				<AddIcon
					color={currentTool === 'add' ? '#2772FF' : '#A8B0C0'}
				/>
				<span style={{ marginLeft: 8 }}>Add</span>
			</div>
		</div>
	)
}

export default Footer
