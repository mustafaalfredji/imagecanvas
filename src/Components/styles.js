export const styles = {
    canvas: {
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/az-subtle.png")',
        overflow: 'hidden',
    },
    generatedImg: {
        width: '100%',
        aspectRatio: '1/1',
        zIndex: 0,
    },
    mask: {
        position: 'absolute',
        left: 0,
        right:0,
        transform: 'translate(0%, -50%)',
        width: '100%',
        aspectRatio: '1/1',
        background: 'rgba(0,0,0,0.5)',
    },
    isLoading: {
        backgroundColor: '#eeeeee',
        background: "linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%)",
        backgroundSize: '200% 100%',
        animation: '1.5s shine linear infinite',
    },
}