const { useState, useEffect } = require('react')
const styles = {
    buttonWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 80
    },
    button: {
        height: 44,
        background: 'linear-gradient(275.12deg, #04ECFD -46.59%, #2772FF 109.3%)',
        color: '#fff',
        borderRadius: 32,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 16,
        fontWeight: 600,
    },
}

const RemoveButton  = ({runRemove, canRemove, isRemoveBG, runRemoveBackground, isVisible}) => {


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

    if(!isVisible) {
        return null
    }

    return (
        <div style={styles.buttonWrapper}>
            <div
                style={{
                    ...styles.button,
                    opacity: canRemove ? 1 : 0.3,
                    width: isRemoveBG ? 200 : 120,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                }}
                onClick={
                    canRemove
                        ? isRemoveBG ? () => runRemoveBackground(canvaFillData) : () => runRemove(canvaFillData)
                        : null
                    }
            >
                {isRemoveBG ? 'Remove Background' : 'Remove'}
            </div>
        </div>
    )
}

export default RemoveButton