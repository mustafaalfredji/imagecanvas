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
        borderRadius: '10px',
        overflow: 'hidden',
        height: 48,
    },
    input: {
        width: '100%',
        borderTopLeftRadius: '10px',
        borderBottomLeftRadius: '10px',
        paddingLeft: '20px',
        border: 'none',
    },
    button: {
        background: "linear-gradient(275.12deg, #04ECFD -46.59%, #2772FF 109.3%)",
        border: 'none',
        borderRadius: '0px 10px 10px 0px',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '10px 24px',
        width: '61.8%',
    },

}

const PromptBox = ({ textPrompt, setTextPrompt, generate }) => {
    const [canvaFillData, setCanvaFillData] = useState(null)

    const handleFillData = (e) => {
        setCanvaFillData(e.detail)
    }
    useEffect(() => {
        document.addEventListener('canva-fill-data',handleFillData, false)

        return () => {
            document.removeEventListener('canva-fill-data', handleFillData, false)
        }
    }, [])

	return (
		<div style={styles.wrapper}>
			<div style={styles.inputWrapper}>
				<input
                    style={styles.input}
					type='text'
					value={textPrompt}
                    placeholder='Prompt (optional)'
					onChange={(e) => setTextPrompt(e.target.value)}
				/>
				<button
                    style={styles.button}
                    onClick={() => generate(canvaFillData)}
                    >Fill</button>
			</div>
		</div>
	)
}

export default PromptBox
