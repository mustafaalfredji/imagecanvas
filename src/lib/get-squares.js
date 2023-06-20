// const calcedData = {
// 	ratio: {
// 		width: ratioInfo.width,
// 		height: ratioInfo.height,
// 	},

// 	squareSize:
// 		ratioInfo.width > ratioInfo.height
// 			? canvasDimensions.height
// 			: canvasDimensions.width,

// 	canva: {
// 		width: canvasDimensions.width,

// 		height: canvasDimensions.height,

// 		topLeft: [0, 0],

// 		bottomRight: [canvasDimensions.width, canvasDimensions.height],
// 	},

// 	image: {
// 		width: imgDimensions.width,

// 		height: imgDimensions.height,

// 		topLeft: [
// 			coordinates.x < 0 ? 0 : coordinates.x,
// 			coordinates.y < 0 ? 0 : coordinates.y,
// 		],

// 		bottomRight: [
// 			coordinates.x + imgDimensions.width > canvasDimensions.width
// 				? canvasDimensions.width
// 				: coordinates.x + imgDimensions.width,

// 			coordinates.y + imgDimensions.height > canvasDimensions.height
// 				? canvasDimensions.height
// 				: coordinates.y + imgDimensions.height,
// 		],
// 	},
// }

export const getSquares = ({ ratioHeight, ratioWidth, canva, image, squareSize }) => {
	const squares = []

	// if image takes all space, then do nothing

	if (
		canva.bottomRight[0] === image.bottomRight[0] &&
		canva.bottomRight[1] === image.bottomRight[1] &&
		canva.topLeft[0] === image.topLeft[0] &&
		canva.topLeft[1] === image.topLeft[1]
	) {
		return squares
	} else if (ratioWidth === ratioHeight) {
		squares.push({
			topLeft: [0, 0],

			bottomRight: [squareSize, squareSize],
		})
	} else if (ratioWidth > ratioHeight) {
		const topLeftY = 0

		const bottomRightY = canva.height

		const xMax = canva.width

		const xMin = 0

		let initialTopLeftX = 0

		let initialBottomRightX = 0

		// handle initial square if image is smaller than square

		if (image.width < squareSize) {
			initialTopLeftX = image.topLeft[0]

			initialBottomRightX =
				image.topLeft[0] + squareSize
		}

		// handle initial square if image is bigger than square

		if (image.width >= squareSize) {
			const centerImageX =
				image.topLeft[0] + image.width / 2

			const hasSpaceSides =
				image.topLeft[1] > topLeftY ||
				image.bottomRight[1] < bottomRightY

			// handle space on sides scenarios

			if (hasSpaceSides && image.topLeft[0] === xMin) {
				initialTopLeftX = xMin

				initialBottomRightX = squareSize
			} else if (
				hasSpaceSides &&
				image.bottomRight[0] === xMax
			) {
				initialTopLeftX = xMax - squareSize

				initialBottomRightX = xMax
			} else if (hasSpaceSides) {
				initialTopLeftX = centerImageX - squareSize / 2

				initialBottomRightX = centerImageX + squareSize / 2
			} else {
				initialTopLeftX = image.topLeft[0]

				initialBottomRightX =
					image.topLeft[0] + squareSize
			}
		}

		if (initialTopLeftX === xMin) {
			initialBottomRightX = squareSize
		} else if (initialBottomRightX > xMax) {
			initialTopLeftX = xMax - squareSize

			initialBottomRightX = xMax
		}

		const initialSquare = {
			topLeft: [initialTopLeftX, topLeftY],

			bottomRight: [initialBottomRightX, bottomRightY],
		}

		squares.push(initialSquare)

		// handle rest of squares

		const spaceRightObj = {
			value: xMax - initialSquare.bottomRight[0],

			lastTopLeftX: initialSquare.topLeft[0],

			lastBottomRightX: initialSquare.bottomRight[0],
		}

		const spaceLeftObj = {
			value: initialSquare.topLeft[0],

			lastTopLeftX: initialSquare.topLeft[0],

			lastBottomRightX: initialSquare.bottomRight[0],
		}

		while (spaceRightObj.value > 0) {
			let topLeftX =
				spaceRightObj.lastBottomRightX - squareSize / 2

			let bottomRightX =
				spaceRightObj.lastBottomRightX + squareSize / 2

			if (bottomRightX > xMax) {
				topLeftX = xMax - squareSize

				bottomRightX = xMax

				spaceRightObj.value = 0
			}

			const square = {
				topLeft: [topLeftX, topLeftY],

				bottomRight: [bottomRightX, bottomRightY],
			}

			squares.push(square)

			spaceRightObj.value = xMax - square.bottomRight[0]

			spaceRightObj.lastTopLeftX = square.topLeft[0]

			spaceRightObj.lastBottomRightX = square.bottomRight[0]
		}

		while (spaceLeftObj.value > 0) {
			let topLeftX = spaceLeftObj.lastTopLeftX - squareSize / 2

			let bottomRightX =
				spaceLeftObj.lastTopLeftX + squareSize / 2

			if (topLeftX < xMin) {
				topLeftX = xMin

				bottomRightX = squareSize

				spaceLeftObj.value = 0
			}

			const square = {
				topLeft: [topLeftX, topLeftY],

				bottomRight: [bottomRightX, bottomRightY],
			}

			squares.push(square)

			spaceLeftObj.value = square.topLeft[0]

			spaceLeftObj.lastTopLeftX = square.topLeft[0]

			spaceLeftObj.lastBottomRightX = square.bottomRight[0]
		}
	} else if (ratioWidth < ratioHeight) {
		const topLeftX = 0

		const bottomRightX = canva.width

		const yMax = canva.height

		const yMin = 0

		let initialTopLeftY = 0

		let initialBottomRightY = 0

		// handle initial square if image is smaller than square

		if (image.height < squareSize) {
			initialTopLeftY = image.topLeft[1]

			initialBottomRightY =
				image.topLeft[1] + squareSize
		}

		// handle initial square if image is bigger than square

		if (image.height >= squareSize) {
			const centerImageY =
				image.topLeft[1] + image.height / 2

			const hasSpaceSides =
				image.topLeft[0] > 0 ||
				image.bottomRight[0] < canva.width

			// handle space on sides scenarios

			if (hasSpaceSides && image.topLeft[1] === yMin) {
				initialTopLeftY = yMin

				initialBottomRightY = squareSize
			} else if (
				hasSpaceSides &&
				image.bottomRight[1] === yMax
			) {
				initialTopLeftY = yMax - squareSize

				initialBottomRightY = yMax
			} else if (hasSpaceSides) {
				initialTopLeftY = centerImageY - squareSize / 2

				initialBottomRightY = centerImageY + squareSize / 2
			} else {
				initialTopLeftY = image.topLeft[1]

				initialBottomRightY =
					image.topLeft[1] + squareSize
			}
		}

		if (initialTopLeftY === yMin) {
			initialBottomRightY = squareSize
		} else if (initialBottomRightY > yMax) {
			initialTopLeftY = yMax - squareSize

			initialBottomRightY = yMax
		}

		const initialSquare = {
			topLeft: [topLeftX, initialTopLeftY],

			bottomRight: [bottomRightX, initialBottomRightY],
		}

		squares.push(initialSquare)

		const spaceBottomObj = {
			value: yMax - initialSquare.bottomRight[1],

			lastTopLeftY: initialSquare.topLeft[1],

			lastBottomRightY: initialSquare.bottomRight[1],
		}

		const spaceTopObj = {
			value: initialSquare.topLeft[1],

			lastTopLeftY: initialSquare.topLeft[1],

			lastBottomRightY: initialSquare.bottomRight[1],
		}

		// fill space on bottom

		while (spaceBottomObj.value > 0) {
			let topLeftY =
				spaceBottomObj.lastBottomRightY - squareSize / 2

			let bottomRightY =
				spaceBottomObj.lastBottomRightY + squareSize / 2

			if (bottomRightY > yMax) {
				topLeftY = yMax - squareSize

				bottomRightY = yMax

				spaceBottomObj.value = 0
			}

			const square = {
				topLeft: [topLeftX, topLeftY],

				bottomRight: [bottomRightX, bottomRightY],
			}

			squares.push(square)

			spaceBottomObj.value = yMax - square.bottomRight[1]

			spaceBottomObj.lastTopLeftY = square.topLeft[1]

			spaceBottomObj.lastBottomRightY = square.bottomRight[1]
		}

		// fill space on top

		while (spaceTopObj.value > 0) {
			let topLeftY = spaceTopObj.lastTopLeftY - squareSize / 2

			let bottomRightY =
				spaceTopObj.lastTopLeftY + squareSize / 2

			if (topLeftY < yMin) {
				topLeftY = yMin

				bottomRightY = squareSize

				spaceTopObj.value = 0
			}

			const square = {
				topLeft: [topLeftX, topLeftY],

				bottomRight: [bottomRightX, bottomRightY],
			}

			squares.push(square)

			spaceTopObj.value = square.topLeft[1]

			spaceTopObj.lastTopLeftY = square.topLeft[1]

			spaceTopObj.lastBottomRightY = square.bottomRight[1]
		}
	}

	return squares
}

