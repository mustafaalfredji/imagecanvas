const express = require('express')
const { Configuration, OpenAIApi } = require('openai')
const fs = require('fs')
const path = require('path')

const cors = require('cors')
const axios = require('axios')

const sharp = require('sharp')
// const { createCanvas, loadImage } = require('canvas')

require('dotenv').config()

const app = express()
app.use(cors()) // Use CORS middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

const openai = new OpenAIApi(new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
}))

const getUniqueId = () => {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const handleSquare = async ({ img, topLeft, bottomRight, scale }) => new Promise((resolve, reject) => {
	// Calculate width and height of the square
	let width = 1024;
	let height = 1024;

	console.log(topLeft, bottomRight)
	console.log({
		left: Math.round(topLeft[0] * scale),
		top: Math.round(topLeft[1] * scale),
		width: Math.round(width),
		height: Math.round(height),
	})
	const outputPath = `temp-images/square-image-${getUniqueId()}.png`
    sharp(img)
        .extract({
            left: Math.round(topLeft[0] * scale),
            top: Math.round(topLeft[1] * scale),
            width: Math.round(width),
            height: Math.round(height),
        })
		.resize(width, height)
		.png() // Ensure the output is in PNG format
        .toFile(outputPath, function(err) {
			// Log any errors
			if(err) {
				reject(err)
			} else {
				resolve(outputPath)
			}
		})
})

const mergeImages = ({ newImage, currentImage, topLeft, bottomRight, scale }) => new Promise((resolve, reject) => {
	let width = 1024;
	let height = 1024;

	const outputPath = `temp-images/merge-image-${getUniqueId()}.png`

	sharp(newImage) // This is your new image
		.resize(width, height)
		.toBuffer() // Convert the new image to a Buffer for overlaying
		.then(data => {
			sharp(currentImage) // This is your original image
				.composite([ // Overlay the new image onto the original image
					{
						input: data,
						top: Math.round(topLeft[1] * scale),
						left: Math.round(topLeft[0] * scale),
					}
				])
				.png()
				.toFile(outputPath, function(err) { // Save the resulting image
					// Log any errors
					if(err) {
						reject(err)
					} else {
						resolve(outputPath)
					}
				})
		})
		.catch(err => {
			reject(err)
		});
})

app.post('/fill-squares', async (req, res) => {
	const { imageData, squares, textPrompt, scale } = req.body
	let imageDataUrl = imageData // The real data URL will be much longer
	let base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '')

	let initialLocalPath = `temp-images/canvas-image-${getUniqueId()}.png`
	await fs.writeFileSync(initialLocalPath, base64Data, 'base64')

	for (let i = 0; i < squares.length; i++) {
		const square = squares[i]
		const squarePath = await handleSquare({
			...square,
			img: initialLocalPath,
			scale,
		})
		console.log('handle square')

		console.log(squarePath)
		const stream = fs.createReadStream(squarePath)
		try {
			const response = await openai.createImageEdit(
				stream,
				textPrompt,
				stream,
				1,
				'1024x1024',
				'b64_json',
			)
			const data = response.data
			const localPath = `temp-images/openai-image-${getUniqueId()}.png`
			await fs.writeFileSync(localPath, data.data[0].b64_json, 'base64')

			const newInitialLocalPath = await mergeImages({
				newImage: localPath,
				currentImage: initialLocalPath,
				scale,
				...square,
			})

			initialLocalPath = newInitialLocalPath

		} catch (error) {
			console.log(error.message)
			res.status(500).send({
				error: 'There was a problem with the API request.',
			})
			break
		}
	}

	res.status(200).send({
		url: `http://localhost:8080/image/${initialLocalPath}`,
		path: initialLocalPath,
		success: true,
	})
})

// app.post('/store-and-fill-image', async (req, res) => {
// 	const { imageData, textPrompt, yCoordinates } = req.body

// 	let imageDataUrl = imageData // The real data URL will be much longer

// 	let base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '')

// 	const uniqueId =
// 		Math.random().toString(36).substring(2, 15) +
// 		Math.random().toString(36).substring(2, 15)

// 	let localPath = `images/canvas-image-${uniqueId}.png`

// 	await fs.writeFileSync(localPath, base64Data, 'base64')

// 	const configuration = new Configuration({
// 		apiKey: process.env.OPENAI_API_KEY,
// 	})

// 	const openai = new OpenAIApi(configuration)

// 	console.log(process.env.OPENAI_API_KEY)

// 	try {
// 		const response = await openai.createImageEdit(
// 			fs.createReadStream(localPath),
// 			textPrompt,
// 			fs.createReadStream(localPath),
// 			1,
// 			'1024x1024'
// 		)
// 		const data = response.data
// 		console.log(data)
// 		res.json({ url: data.data[0].url, success: true }) // adjust as needed
// 	} catch (error) {
// 		console.error('There was a problem with the API request: ', error)
// 		res.status(500).json({
// 			error: 'There was a problem with the API request.',
// 		})
// 	}
// })

// app.post('/fill-image', async (req, res) => {
// 	const { imageUrl, textPrompt, yCoordinates } = req.body

// 	const configuration = new Configuration({
// 		apiKey: process.env.OPENAI_API_KEY,
// 	})

// 	const openai = new OpenAIApi(configuration)

// 	console.log(process.env.OPENAI_API_KEY)

// 	try {
// 		const response = await openai.createImageEdit(
// 			fs.createReadStream(imageUrl),
// 			textPrompt,
// 			fs.createReadStream(imageUrl),
// 			1,
// 			'1024x1024'
// 		)
// 		const data = response.data
// 		console.log(data)
// 		res.json({ url: data.data[0].url, success: true }) // adjust as needed
// 	} catch (error) {
// 		console.error('There was a problem with the API request: ', error)
// 		res.status(500).json({
// 			error: 'There was a problem with the API request.',
// 		})
// 	}
// })

// app.post('/upper-transparent', async (req, res) => {
// 	const { imageUrl, yCoordinates } = req.body

// 	const uniqueId =
// 		Math.random().toString(36).substring(2, 15) +
// 		Math.random().toString(36).substring(2, 15)

// 	let localPath = path.join(__dirname, `/images/canvas-image-${uniqueId}.png`)

// 	const size = 1024

// 	// Check if images directory exists
// 	const imagesDirectory = path.join(__dirname, '/images')
// 	if (!fs.existsSync(imagesDirectory)) {
// 		// If not, create it
// 		fs.mkdirSync(imagesDirectory)
// 	}

// 	axios
// 		.get(imageUrl, { responseType: 'arraybuffer' })
// 		.then((response) => {
// 			let imgData = Buffer.from(response.data, 'binary')

// 			loadImage(imgData).then((img) => {
// 				console.log(img)
// 				const canvas = createCanvas(size, size)
// 				const context = canvas.getContext('2d')

// 				context.drawImage(
// 					img, // image src
// 					0, // x
// 					0, // y
// 					size, // width
// 					size / 2, // height
// 					0, // x position on canvas
// 					size / 2, // y position on canvas
// 					size, // width on canvas
// 					size / 2 // height on canvas
// 				)

// 				const buffer = canvas.toBuffer() // get the buffer

// 				sharp(buffer)
// 					.png() // convert to png to maintain transparency
// 					.toFile(localPath) // output the image
// 					.then(() => {
// 						console.log(
// 							'Image processing complete.',
// 							'localPath: ',
// 							localPath
// 						)
// 						res.json({ success: true, url: localPath })
// 					})
// 					.catch((err) => console.log(err))
// 			})
// 		})
// 		.catch((err) => console.log(err))
// })

// app.post('/get-aspect-ratio', async (req, res) => {
// 	const { imageUrl } = req.body
// 	const getAspectRatio = async (filePath) => {
// 		const metadata = await sharp(filePath).metadata();
// 		return metadata.width / metadata.height;
// 	};
	
// 	// Use it like this:
// 	getAspectRatio(imageUrl)
// 		.then(aspectRatio => {
// 			res.json({ aspectRatio, success: true })
// 		})
// 		.catch(err => console.error(err));
// })

// app.post('/lower-transparent', async (req, res) => {
// 	const { imageUrl, yCoordinates } = req.body

// 	const uniqueId =
// 		Math.random().toString(36).substring(2, 15) +
// 		Math.random().toString(36).substring(2, 15)

// 	let localPath = path.join(__dirname, `/images/canvas-image-${uniqueId}.png`)

// 	const size = 1024

// 	// Check if images directory exists
// 	const imagesDirectory = path.join(__dirname, '/images')
// 	if (!fs.existsSync(imagesDirectory)) {
// 		// If not, create it
// 		fs.mkdirSync(imagesDirectory)
// 	}

// 	axios
// 		.get(imageUrl, { responseType: 'arraybuffer' })
// 		.then((response) => {
// 			let imgData = Buffer.from(response.data, 'binary')

// 			loadImage(imgData).then((img) => {
// 				const canvas = createCanvas(size, size)
// 				const context = canvas.getContext('2d')

// 				context.drawImage(
// 					img, // image src
// 					0, // x
// 					size / 2, // y
// 					size, // width
// 					size / 2, // height
// 					0, // x position on canvas
// 					0, // y position on canvas
// 					size, // width on canvas
// 					size / 2 // height on canvas
// 				)

// 				const buffer = canvas.toBuffer() // get the buffer

// 				sharp(buffer)
// 					.png() // convert to png to maintain transparency
// 					.toFile(localPath) // output the image
// 					.then(() => {
// 						console.log(
// 							'Image processing complete.',
// 							'localPath: ',
// 							localPath
// 						)
// 						res.json({ success: true, url: localPath })
// 					})
// 					.catch((err) => console.log(err))
// 			})
// 		})
// 		.catch((err) => console.log(err))
// })

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Server is running on port ${port}`))
