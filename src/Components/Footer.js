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
		fontSize: 14,
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
				Fill
			</div>

			<div
				onClick={() => setCurrentTool('erase')}
				style={{
					...styles.footerItem,
					color: currentTool === 'erase' ? '#2772FF' : '#A8B0C0',
				}}
			>
				Erase
			</div>

			<div
				onClick={() => setCurrentTool('add')}
				style={{
					...styles.footerItem,
					color: currentTool === 'add' ? '#2772FF' : '#A8B0C0',
				}}
			>
				Add
			</div>
		</div>
	)
}

export default Footer
