const express = require('express')
const { Configuration, OpenAIApi } = require('openai')
const fs = require('fs')
const path = require('path')

const cors = require('cors')
const axios = require('axios')

const sharp = require('sharp')
const { createCanvas, loadImage } = require('canvas')

require('dotenv').config()

const app = express()
app.use(cors()) // Use CORS middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.post('/store-and-fill-image', async (req, res) => {
	const { imageData, textPrompt, yCoordinates } = req.body

	let imageDataUrl = imageData // The real data URL will be much longer

	let base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '')

	const uniqueId =
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)

	let localPath = `images/canvas-image-${uniqueId}.png`

	await fs.writeFileSync(localPath, base64Data, 'base64')

	const configuration = new Configuration({
		apiKey: process.env.OPENAI_API_KEY,
	})

	const openai = new OpenAIApi(configuration)

	console.log(process.env.OPENAI_API_KEY)

	try {
		const response = await openai.createImageEdit(
			fs.createReadStream(localPath),
			textPrompt,
			fs.createReadStream(localPath),
			1,
			'1024x1024'
		)
		const data = response.data
		console.log(data)
		res.json({ url: data.data[0].url, success: true }) // adjust as needed
	} catch (error) {
		console.error('There was a problem with the API request: ', error)
		res.status(500).json({
			error: 'There was a problem with the API request.',
		})
	}
})

app.post('/fill-image', async (req, res) => {
	const { imageUrl, textPrompt, yCoordinates } = req.body

	const configuration = new Configuration({
		apiKey: process.env.OPENAI_API_KEY,
	})

	const openai = new OpenAIApi(configuration)

	console.log(process.env.OPENAI_API_KEY)

	try {
		const response = await openai.createImageEdit(
			fs.createReadStream(imageUrl),
			textPrompt,
			fs.createReadStream(imageUrl),
			1,
			'1024x1024'
		)
		const data = response.data
		console.log(data)
		res.json({ url: data.data[0].url, success: true }) // adjust as needed
	} catch (error) {
		console.error('There was a problem with the API request: ', error)
		res.status(500).json({
			error: 'There was a problem with the API request.',
		})
	}
})

app.post('/upper-transparent', async (req, res) => {
	const { imageUrl, yCoordinates } = req.body

	const uniqueId =
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)

	let localPath = path.join(__dirname, `/images/canvas-image-${uniqueId}.png`)

	const size = 1024

	// Check if images directory exists
	const imagesDirectory = path.join(__dirname, '/images')
	if (!fs.existsSync(imagesDirectory)) {
		// If not, create it
		fs.mkdirSync(imagesDirectory)
	}

	axios
		.get(imageUrl, { responseType: 'arraybuffer' })
		.then((response) => {
			let imgData = Buffer.from(response.data, 'binary')

			loadImage(imgData).then((img) => {
				console.log(img)
				const canvas = createCanvas(size, size)
				const context = canvas.getContext('2d')

				context.drawImage(
					img, // image src
					0, // x
					0, // y
					size, // width
					size / 2, // height
					0, // x position on canvas
					size / 2, // y position on canvas
					size, // width on canvas
					size / 2 // height on canvas
				)

				const buffer = canvas.toBuffer() // get the buffer

				sharp(buffer)
					.png() // convert to png to maintain transparency
					.toFile(localPath) // output the image
					.then(() => {
						console.log(
							'Image processing complete.',
							'localPath: ',
							localPath
						)
						res.json({ success: true, url: localPath })
					})
					.catch((err) => console.log(err))
			})
		})
		.catch((err) => console.log(err))
})

app.post('/get-aspect-ratio', async (req, res) => {
	const { imageUrl } = req.body
	const getAspectRatio = async (filePath) => {
		const metadata = await sharp(filePath).metadata();
		return metadata.width / metadata.height;
	};
	
	// Use it like this:
	getAspectRatio(imageUrl)
		.then(aspectRatio => {
			res.json({ aspectRatio, success: true })
		})
		.catch(err => console.error(err));
})

app.post('/lower-transparent', async (req, res) => {
	const { imageUrl, yCoordinates } = req.body

	const uniqueId =
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)

	let localPath = path.join(__dirname, `/images/canvas-image-${uniqueId}.png`)

	const size = 1024

	// Check if images directory exists
	const imagesDirectory = path.join(__dirname, '/images')
	if (!fs.existsSync(imagesDirectory)) {
		// If not, create it
		fs.mkdirSync(imagesDirectory)
	}

	axios
		.get(imageUrl, { responseType: 'arraybuffer' })
		.then((response) => {
			let imgData = Buffer.from(response.data, 'binary')

			loadImage(imgData).then((img) => {
				const canvas = createCanvas(size, size)
				const context = canvas.getContext('2d')

				context.drawImage(
					img, // image src
					0, // x
					size / 2, // y
					size, // width
					size / 2, // height
					0, // x position on canvas
					0, // y position on canvas
					size, // width on canvas
					size / 2 // height on canvas
				)

				const buffer = canvas.toBuffer() // get the buffer

				sharp(buffer)
					.png() // convert to png to maintain transparency
					.toFile(localPath) // output the image
					.then(() => {
						console.log(
							'Image processing complete.',
							'localPath: ',
							localPath
						)
						res.json({ success: true, url: localPath })
					})
					.catch((err) => console.log(err))
			})
		})
		.catch((err) => console.log(err))
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Server is running on port ${port}`))
