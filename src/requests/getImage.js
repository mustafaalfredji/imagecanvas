import axios from 'axios';

export const storeAndFill = async (imageData, yPosition) => {
    const response = await axios.post('http://localhost:8080/store-and-fill-image', {
        imageData: imageData,
        yCoordinates: yPosition,
        textPrompt: 'A realistic, high resolution image in the style award winning 4k photography, and images from instagram'
    });

    const data = response.data;

    console.log(data)
    return data.url
}

export const fillImage = async (imageUrl, yPosition) => {
    const response = await axios.post('http://localhost:8080/fill-image', {
        imageUrl: imageUrl,
        yCoordinates: yPosition,
        textPrompt: 'A realistic, high resolution image in the style award winning 4k photography, and images from instagram'
    });

    const data = response.data;

    console.log(data)
    return data.url
}

export const getAspectRatio = async (imageUrl) => {
    const response = await axios.post('http://localhost:8080/get-aspect-ratio', {
        imageUrl: imageUrl,
    });

    const data = response.data;

    console.log(data)
    return data.aspectRatio
}

export const getUpperTransparent = async (imageUrl, yPosition) => {
    const response = await axios.post('http://localhost:8080/upper-transparent', {
        imageUrl: imageUrl,
        yCoordinates: yPosition,
    });

    const data = response.data;

    console.log('upperTrans', data)
    return data.url
}

export const getLowerTransparent = async (imageUrl, yPosition) => {
    const response = await axios.post('http://localhost:8080/lower-transparent', {
        imageUrl: imageUrl,
        yCoordinates: yPosition,
    });

    const data = response.data;

    console.log('lowertrans', data)
    return data.url
}