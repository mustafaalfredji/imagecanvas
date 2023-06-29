import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

import FillControls from './FillControls'
// import CanvasEmpty from './CanvasEmpty'
import PromptBox from './PromptBox'
// import SimpleCanvas from './SimpleCanvas'
import ManageGenerate from './LoadingImg'

import AspectRatioPreview from './AspectRatioPreview'
import { aspectRatioGenerator } from '../lib/aspectRatioGenerator'

const imagineDataPlaceholder = {
	progress: 0,
	response: {
		imageUrls: ['', '', '', ''],
		buttons: ['U1', '', 'V2', ''],
	},
	progressImageUrl: '',
}

const imagineDataPlaceholder2 = {"progress":100,"response":{"createdAt":"2023-06-27T22:43:38.647Z","originatingMessageId":"X4RV7JBTul2gNflWbejC","buttons":["U1","U2","U3","U4","V1","V2","V3","V4"],"imageUrl":"https://cdn.discordapp.com/attachments/1072518361050775622/1123383167294910588/musti_A_realistic_photo_of_a_well-organized_fitness_meal_prep_s_93c14938-a441-42ff-9b3c-92a85cb5c375.webp","imageUrls":["https://cdn.midjourney.com/93c14938-a441-42ff-9b3c-92a85cb5c375/0_0.png","https://cdn.midjourney.com/93c14938-a441-42ff-9b3c-92a85cb5c375/0_1.png","https://cdn.midjourney.com/93c14938-a441-42ff-9b3c-92a85cb5c375/0_2.png","https://cdn.midjourney.com/93c14938-a441-42ff-9b3c-92a85cb5c375/0_3.png"],"responseAt":"2023-06-27T22:43:38.896Z","description":"","type":"imagine","content":"A realistic photo of a well-organized fitness meal prep, spread across a sleek, wooden kitchen table. Diverse colors from fresh vegetables, lean proteins, and whole grains. Natural, soft lighting enhances the vivid hues. Top-down, high-definition view, 4K, hyper-realistic in the style of realism. --ar 9:16 --v 5.2","buttonMessageId":"Ug3iBqmkXrrhr2MD1oPQ"}}

const imagineDataPlaceholder3 = {
	progress: 100,
	response: {
	  createdAt: '2023-06-27T23:10:30.781Z',
	  originatingMessageId: 'mYZjtKsJCbQwnRqvsLh3',
	  ref: '',
	  buttons: [
		'🪄 Vary (Strong)',
		'🪄 Vary (Subtle)',
		'🔍 Zoom Out 2x',
		'🔍 Zoom Out 1.5x',
		'🔍 Custom Zoom',
		'↔️ Make Square',
		'Web'
	  ],
	  imageUrl: 'https://cdn.discordapp.com/attachments/1072518361050775622/1123389929209221140/musti_A_realistic_photo_of_a_well-organized_fitness_meal_prep_s_4eb260f1-d026-4dbc-b306-21d7f85263cb.png',
	  imageUrls: [
		'https://cdn.midjourney.com/4eb260f1-d026-4dbc-b306-21d7f85263cb/0_0.png',
		'https://cdn.midjourney.com/4eb260f1-d026-4dbc-b306-21d7f85263cb/0_1.png',
		'https://cdn.midjourney.com/4eb260f1-d026-4dbc-b306-21d7f85263cb/0_2.png',
		'https://cdn.midjourney.com/4eb260f1-d026-4dbc-b306-21d7f85263cb/0_3.png'
	  ],
	  responseAt: '2023-06-27T23:10:30.999Z',
	  description: '',
	  type: 'button',
	  content: 'A realistic photo of a well-organized fitness meal prep, spread across a sleek, wooden kitchen table. Diverse colors from fresh vegetables, lean proteins, and whole grains. Natural, soft lighting enhances the vivid hues. Top-down, high-definition view, 4K, hyper-realistic in the style of realism. --ar 9:16 --v 5.2',
	  buttonMessageId: 'k9uKHtF6Ods7fnSwlrTA'
	}
  }

const CanvasUI = ({
	workingAreaHeight,
}) => {
	const [aspectRatio, setAspectRatio] = useState(0)
	const [isLoading, setIsLoading] = useState(false)
	const [textPrompt, setTextPrompt] = useState('')
	const [imagineData, setImagineData] = useState(imagineDataPlaceholder)
	const [loadingType, setLoadingType] = useState('')

	const drawingComponentRef = useRef(null)

	const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

	const callImagineApi = async ({ prompt }) => {
		const response = await axios.post('http://localhost:8080/imagine', {
			prompt,
		})

		console.log(response.data)

		sleep(2000)
		const messageId = response.data.messageId
		getMessageProgress({ messageId })
	}

	const callButtonApi = async ({ buttonIndex, action, expectedButtonString }) => {
		const response = await axios.post('http://localhost:8080/press-button', {
			buttonIndex,
			action,
			expectedButtonString,
			buttonMessageId: imagineData.response.buttonMessageId,
			buttons: imagineData.response.buttons,
		})

		sleep(2000)
		setImagineData(imagineDataPlaceholder)
		if(action === 'upscale') {
			setLoadingType('upscale')
		} 

		if(action === 'variant') {
			setLoadingType('variant')
		}

		getMessageProgress({ messageId: response.data.data.messageId })
	}

	console.log(imagineData)

	const getMessageProgress = async ({ messageId }) => {

		const ws = new WebSocket(`ws://localhost:6060/${messageId}`)

		await axios.post(`http://localhost:8080/get-imagine-progress`, {
			messageId: messageId,
		})
		ws.onopen = () => {
			console.log('Connected to WebSocket server')
			// You can also send a message to the server after the connection is established
			// ws.send('Hello Server!');
		}

		ws.onmessage = (message) => {
			console.log('Received:', message.data)
			const data = JSON.parse(message.data)
			let modifiedData = {}
			if (data.progress === 100) {
				modifiedData = {
					...data,
				}
			} else {
				modifiedData = {
					...data,
					response: {
						...data.response,
						imageUrls: ['', '', '', ''],
					},
				}
			}

			setImagineData(modifiedData) // Assuming the server sends JSON data
		}

		ws.onerror = (error) => {
			console.error('WebSocket error:', error)
		}

		ws.onclose = () => {
			console.log('WebSocket connection closed')
		}

		// Clean up the WebSocket connection when the component is unmounted
		return () => {
			ws.close()
		}
	}

	const onCancel = () => {
		setIsLoading(false)
	}

	const handleRunImagine = async () => {
		if (textPrompt.length < 5) {
			alert('Please enter a prompt longer than 5 characters')
			return
		}
		setIsLoading(true)
		const newPrompt = textPrompt + ' ' + aspectRatioGenerator(aspectRatio)
		callImagineApi({ prompt: newPrompt })
	}

	const handleRunButton = async (buttonIndex, action, expectedButtonString) => {
		callButtonApi({ buttonIndex, action, expectedButtonString })
	}

	console.log('buttons', imagineData.response.buttons)
	return (
		<div>
			{isLoading && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						bottom: 0,
						right: 0,
						left: 0,
						zIndex: 122,
					}}
				>
					<ManageGenerate
						handleRunButton={handleRunButton}
						buttons={imagineData.response.buttons || []}
						workingHeight={workingAreaHeight - 240}
						loadingImages={imagineData.response.imageUrls || []}
						onCancel={onCancel}
						progress={imagineData.progress === 0 ? 10 : imagineData.progress}
						aspectRatio={aspectRatio}
						isFinished={imagineData.progress === 100}
						progressImageUrl={imagineData.progressImageUrl || ''}
						loadingType={loadingType}
						upscaleImage={imagineData.response.imageUrl}
					/>
				</div>
			)}

			<AspectRatioPreview
				aspectRatio={aspectRatio}
				workingHeight={workingAreaHeight - 160}
			/>
			{/* {image ? (
					<SimpleCanvas
						image={image}
						currentTool={'fill'}
						aspectRatio={aspectRatio}
						workingHeight={workingAreaHeight - 160}
						imageDimensions={imageDimensions}
						ref={drawingComponentRef}
					/>
				) : (
				)} */}
			<div>
				<div style={{ height: 80 }}>
					<PromptBox
						generate={handleRunImagine}
						textPrompt={textPrompt}
						setTextPrompt={setTextPrompt}
						generationText={'fill'}
						isVisible
						isActive
						placeholder={'Prompt'}
					/>
				</div>
				<div style={{ height: 80 }}>
					<FillControls
						isVisible={true}
						currentCanvas={aspectRatio}
						setCurrentCanvas={setAspectRatio}
					/>
				</div>
			</div>
		</div>
	)
}

export default CanvasUI
