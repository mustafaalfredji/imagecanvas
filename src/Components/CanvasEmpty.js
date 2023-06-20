import {ReactComponent as UploadIcon} from '../resources/upload.svg'

const CanvasEmpty = ({ clickUpload }) => {
	return (
		<div
			style={{
				padding: 16,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
                height: window.innerHeight - 32,
			}}
		>
			<div
				onClick={clickUpload}
				style={{
					height: window.innerHeight / 2,
					backgroundColor: '#fff',
					color: '#2772FF',
					cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    borderRadius: 16,
					flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: 'drop-shadow(0px 0px 14px rgba(0, 0, 0, 0.25))'
				}}
			>
				<UploadIcon
					style={{
						height: 48,
						width: 48,
					}}
				/>
				<p>
				Upload Image

				</p>
			</div>
		</div>
	)
}

export default CanvasEmpty
