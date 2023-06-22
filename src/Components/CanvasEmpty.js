
import {ReactComponent as UploadIcon} from '../resources/upload.svg'
import { useEffect } from 'react'

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

const CanvasEmpty = ({ clickUpload, workingHeight, aspectRatio }) => {

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

	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
                height: workingHeight,
				width: '100%',
			}}
		>
			<div
				onClick={clickUpload}
				style={{
					height: decideDimensions().height,
					width: decideDimensions().width,
					backgroundColor: '#fff',
					color: '#2772FF',
					cursor: 'pointer',
                    display: 'flex',
					aspectRatio: aspectRatioGenerator(aspectRatio).ratio,
					flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
					border: '1px dashed #ccc',
					transition: 'all 0.2s ease',
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
