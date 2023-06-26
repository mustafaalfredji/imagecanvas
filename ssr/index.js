const express = require('express')
const { Configuration, OpenAIApi } = require('openai')
const fs = require('fs')
const path = require('path')


const cors = require('cors')
const axios = require('axios')

const sharp = require('sharp')
const Jimp = require('jimp')

const http = require('http');
const WebSocket = require('ws');


// const { createCanvas, loadImage } = require('canvas')

require('dotenv').config()

const app = express()
const server = http.createServer(app);

const wss = new WebSocket.Server({ port: 6060 });

// Store the WebSocket connections in the clients map when a connection is established
wss.on('connection', (ws, req) => {
  const messageId = req.url.substring(1); // assuming that the messageId is passed in the url like ws://localhost:8080/<messageId>
  clients.set(messageId, ws);

  ws.on('close', () => {
    clients.delete(messageId); // Remove the WebSocket connection from the clients map when it's closed
  });
});

app.use(cors()) // Use CORS middleware
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use('/image', express.static('temp-images'))

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	next()
})

const clients = new Map();

const openai = new OpenAIApi(
	new Configuration({
		apiKey: process.env.OPENAI_API_KEY,
	})
)

let IMAGE_HOST_API_KEY = process.env.IMAGE_HOST_API_KEY
let REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN

const getUniqueId = () => {
	return (
		Math.random().toString(36).substring(2, 15) +
		Math.random().toString(36).substring(2, 15)
	)
}

const handleSquare = async ({ img, topLeft, bottomRight, scale }) =>
	new Promise(async (resolve, reject) => {
		// Calculate width and height of the square
		const width = Math.round((bottomRight[0] - topLeft[0]) * scale)
		const height = Math.round((bottomRight[1] - topLeft[1]) * scale)

		console.log('handling square image' + img)

		const outputPath = `temp-images/square-image-${getUniqueId()}.png`

		sharp(img)
			.extract({
				left: Math.round(topLeft[0] * scale),
				top: Math.round(topLeft[1] * scale),
				width: width,
				height: height,
			})
			.png()
			.resize(1024, 1024) // Resize the output to 1024x1024
			.toFile(outputPath, function (err) {
				// Log any errors
				if (err) {
					reject(err)
				} else {
					console.log('sharp writing image')
					return outputPath
				}
			})

		await new Promise((resolve) => setTimeout(resolve, 2000))

		// wait for the image to be written
		let newOutputPath = `/temp-images/minified-image-${getUniqueId()}.png`
		// read the image
		Jimp.read(__dirname + '/' + outputPath)
			.then((image) => {
				// loop over each pixel
				image.scan(
					0,
					0,
					image.bitmap.width,
					image.bitmap.height,
					function (x, y, idx) {
						// get the transparent pixels

						const alpha = this.bitmap.data[idx + 3]

						// if the pixel is transparent
						if (alpha === 0) {
							// set red, green and blue to 0
							this.bitmap.data[idx + 0] = 0
							this.bitmap.data[idx + 1] = 0
							this.bitmap.data[idx + 2] = 0

							// and make the alpha transparent too
							this.bitmap.data[idx + 3] = 0
						}
					}
				)

				console.log('writing image' + __dirname + newOutputPath)
				// write the image
				image.write(__dirname + newOutputPath)

				console.log('handled writing image', outputPath)
			})
			.catch((err) => {
				console.error(err)
			})

		resolve(__dirname + newOutputPath)

		console.log('handled square image', __dirname + newOutputPath)
	})

const mergeImages = ({ newImage, currentImage, topLeft, bottomRight, scale }) =>
	new Promise((resolve, reject) => {
		let width = 1024
		let height = 1024

		const outputPath = `temp-images/merge-image-${getUniqueId()}.png`

		console.log('merging images' + newImage + ' ' + currentImage)
		sharp(newImage) // This is your new image
			.resize(width, height)
			.toBuffer() // Convert the new image to a Buffer for overlaying
			.then((data) => {
				sharp(currentImage) // This is your original image
					.composite([
						// Overlay the new image onto the original image
						{
							input: data,
							top: Math.round(topLeft[1] * scale),
							left: Math.round(topLeft[0] * scale),
						},
					])
					.png() // Ensure the output is in PNG format
					.toFile(outputPath, function (err) {
						// Save the resulting image
						// Log any errors
						if (err) {
							reject(err)
						} else {
							resolve(outputPath)
						}
					})
			})
			.catch((err) => {
				reject(err)
			})

		console.log('merged images', outputPath)
	})

app.post('/get-prediction', async (req, res) => {
	const { getUrl } = req.body
	const response = await axios.get(getUrl, {
		headers: {
			Authorization: "Token " + REPLICATE_API_TOKEN,
			'Content-Type': 'application/json',
		},
	})

	const prediction = response.data

	res.end(JSON.stringify(prediction))
})

app.post('/upload-image', async (req, res) => {
	try {
		const { image } = req.body

		const authKey = IMAGE_HOST_API_KEY

		const imageFormData = "key=" + authKey + "&source=" + encodeURIComponent(image) + "&format=json"

		const imageUploadResponse = await axios({
			method: 'post',
			url: 'https://freeimage.host/api/1/upload',
			data: imageFormData,
			headers: {
				// content-type url png not encoded
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})

		// Get the URLs of the uploaded images
		const imageURL = imageUploadResponse.data.image.url

		res.status(200).send({ success: true, url: imageURL })
	} catch (err) {
		console.log(err)
	}
})

app.post('/remove-object', async (req, res) => {
	try {
		const { image, maskImage } = req.body

		const authKey = IMAGE_HOST_API_KEY
		const imageFormData = "key=" + authKey + "&source=" + encodeURIComponent(image) + "&format=json"
		const maskFormData = "key=" + authKey + "&source=" + encodeURIComponent(maskImage) + "&format=json"

		const imageUploadResponse = await axios({
			method: 'post',
			url: 'https://freeimage.host/api/1/upload',
			data: imageFormData,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})

		const maskImageUploadResponse = await axios({
			method: 'post',
			url: 'https://freeimage.host/api/1/upload',
			data: maskFormData,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})

		// Get the URLs of the uploaded images
		const imageURL = imageUploadResponse.data.image.url
		const maskImageURL = maskImageUploadResponse.data.image.url

		// console.log('imageURL', imageURL)
		// console.log('maskImageURL', maskImageURL)

		const input = {
			image: imageURL,
			mask: maskImageURL,
		}

		const Authorization = "Token " + REPLICATE_API_TOKEN

		const replicateResponse = await axios.post(
			'https://api.replicate.com/v1/predictions',
			{
				version:
					'cdac78a1bec5b23c07fd29692fb70baa513ea403a39e643c48ec5edadb15fe72',
				input,
			},
			{
				headers: {
					Authorization: Authorization,
					'Content-Type': 'application/json',
				},
			}
		)

		const output = replicateResponse.data

		res.status(200).send({ success: true, getUrl: output.urls.get })
	} catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})


app.post('/get-imagine-progress', async (req, res) => {
	const { messageId } = req.body; // Get messageId from the request body
	const token = process.env.THE_NEXT_LEG_API_TOKEN;
  
	// Call the getProgress function to start getting updates
	getProgress(messageId, token);
  
	res.status(200).send({ success: true });
  });
  
  async function getProgress(messageId, token) {
	console.log('getProgress', messageId)
  
	// sleep for 2 seconds before calling the API
	await new Promise((resolve) => setTimeout(resolve, 2000));
	try {
	  const response = await axios.get(`https://api.thenextleg.io/v2/message/${messageId}?expireMins=4`, {
		headers: {
		  'Authorization': `Bearer ${token}`,
		},
	  });
	  
	  // Find the WebSocket connection in the clients map using messageId
	  const ws = clients.get(messageId);
	  if (ws) {
		// Send the progress to the client through the WebSocket connection
		ws.send(JSON.stringify(response.data));
	  }
  
	  // If the progress is not 100 and not 'incomplete', call the getProgress function again after a delay
	  if (response.data.progress !== 100 && response.data.progress !== 'incomplete') {
		setTimeout(() => getProgress(messageId, token), 4000); // Wait for 5 seconds before calling again
	  }
	} catch (error) {
	  console.log(error);
	}
  }

app.post('/imagine', async (req, res) => {
    const { prompt } = req.body;

    const data = {
        "msg": prompt + ' --v 5.2',  // from the request body
    };

	const token = process.env.THE_NEXT_LEG_API_TOKEN

    const config = {
        method: 'post',
        url: 'https://api.thenextleg.io/v2/imagine',
        headers: {
            'Authorization': `Bearer ${token}`,  // from the request body
            'Content-Type': 'application/json'
        },
        data : data
    };

    try {
        const response = await axios.post(config.url, config.data, { headers: config.headers });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing your request');
    }
});


app.post('/webhook', (req, res) => {
    const payload = req.body;

    // Broadcast the payload to all connected WebSocket clients
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
        }
    });

    res.status(200).send('Received');
});


app.post('/remove-background', async (req, res) => {
	try {
		const { image } = req.body

		const authKey = IMAGE_HOST_API_KEY

		const imageFormData = "key=" + authKey + "&source=" + encodeURIComponent(image) + "&format=json"

		const imageUploadResponse = await axios({
			method: 'post',
			url: 'https://freeimage.host/api/1/upload',
			data: imageFormData,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		})

		// Get the URLs of the uploaded images
		const imageURL = imageUploadResponse.data.image.url

		// model input
		const input = {
			image: imageURL,
		}

		const Authorization = "Token " + REPLICATE_API_TOKEN
		const replicateResponse = await axios.post(
			'https://api.replicate.com/v1/predictions',
			{
				version:
					'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
				input,
			},
			{
				headers: {
					Authorization: Authorization,
					'Content-Type': 'application/json',
				},
			}
		)

		const output = replicateResponse.data

		res.status(200).send({ success: true, getUrl: output.urls.get })
	} catch (err) {
		console.error(err)
		res.status(500).send(err.message)
	}
})

app.post('/fill-squares', async (req, res) => {
	const { imageData, squares, textPrompt, scale } = req.body
	let imageDataUrl = imageData // The real data URL will be much longer
	let base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '')

	let initialLocalPath = `temp-images/canvas-image-${getUniqueId()}.png`
	await fs.writeFileSync(initialLocalPath, base64Data, 'base64')

	console.log('squares', squares)
	for (let i = 0; i < squares.length; i++) {
		const square = squares[i]
		const squarePath = await handleSquare({
			...square,
			img: initialLocalPath,
			scale,
		})

		// await for 2000ms the file to be written to disk before calling the api
		await new Promise((resolve) => setTimeout(resolve, 2000))

		const stream = fs.createReadStream(squarePath)

		try {
			console.log('calling openai api')
			const response = await openai.createImageEdit(
				stream,
				textPrompt,
				stream,
				1,
				'1024x1024',
				'b64_json'
			)
			console.log('openai api response')
			const data = response.data
			const localPath = `temp-images/openai-image-${getUniqueId()}.png`

			console.log('writing file to disk' + localPath)
			await fs.writeFileSync(localPath, data.data[0].b64_json, 'base64')

			const newInitialLocalPath = await mergeImages({
				newImage: localPath,
				currentImage: initialLocalPath,
				scale,
				...square,
			})

			initialLocalPath = newInitialLocalPath
		} catch (error) {
			if (error.response) {
				console.log(error.response.status)
				console.log(error.response.data.error.message)
				res.status(500).send({
					error: error.response.data.error.message,
				})
			} else {
				console.log(error.message)
			}

			break
		}
	}

	// read back the image and upload it to freeimage.host

	await new Promise((resolve) => setTimeout(resolve, 2000))

	const image = fs.readFileSync(__dirname + '/' + initialLocalPath, 'base64')

	const authKey = IMAGE_HOST_API_KEY

	const imageFormData = "key=" + authKey + "&source=" + encodeURIComponent(image) + "&format=json"

	// upload the image to freeimage.host
	console.log('uploading image to freeimage.host')
	const imageUploadResponse = await axios({
		method: 'post',
		url: 'https://freeimage.host/api/1/upload',
		data: imageFormData,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	})

	const imageURL = imageUploadResponse.data.image.url // your image url

	let dimensions = await axios({
		url: imageURL,
		responseType: 'arraybuffer'
	  })
		.then(response => {
		  return sharp(Buffer.from(response.data))
			.metadata()
			.then(info => {
			  console.log(info.width, info.height);
			  return { width: info.width, height: info.height };
			});
		})
		.catch(err => {
		  console.error(err);
		});

	// get new image dimensions and return them

	res.status(200).send({
		url: imageURL,
		dimensions,
		path: initialLocalPath,
		success: true,
	})
})

const port = process.env.PORT || 8080
server.listen(port, () => console.log('Server is listening on port ' + port));
