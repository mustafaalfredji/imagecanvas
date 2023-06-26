export const aspectRatioGenerator = (index) => {
	if (index === 0) {
		return '--ar 9:16'
	}
	if (index === 1) {
		return '--ar 3:4'
	}
	if (index === 2) {
		return '--ar 1:1'
	}
	if (index === 3) {
		return '--ar 4:3'
	}
	if (index === 4) {
		return '--ar 16:9'
	}
}