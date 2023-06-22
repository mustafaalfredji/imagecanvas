const component = ({ color }) => (
	<svg
		width='32'
		height='32'
		viewBox='0 0 32 32'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			fillRule='evenodd'
			clipRule={'evenodd'}
			d='M16.0001 28.333C22.8107 28.333 28.3334 22.8117 28.3334 15.9997C28.3334 9.18901 22.8107 3.66634 16.0001 3.66634C9.18942 3.66634 3.66675 9.18901 3.66675 15.9997C3.66675 22.8117 9.18942 28.333 16.0001 28.333Z'
			stroke={color}
			stroke-width='1.5'
			stroke-linecap='round'
			stroke-linejoin='round'
		/>
		<path
			d='M14.0769 20.6279L18.7249 15.9999L14.0769 11.3719'
			stroke={color}
			stroke-width='1.5'
			stroke-linecap='round'
			stroke-linejoin='round'
		/>
	</svg>
)

export default component
