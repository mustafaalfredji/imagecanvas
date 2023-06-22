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
			d='M15.9999 3.66699C9.18925 3.66699 3.66658 9.18832 3.66658 16.0003C3.66658 22.811 9.18925 28.3337 15.9999 28.3337C22.8106 28.3337 28.3333 22.811 28.3333 16.0003C28.3333 9.18832 22.8106 3.66699 15.9999 3.66699Z'
			stroke={color}
			stroke-width='1.5'
			stroke-linecap='round'
			stroke-linejoin='round'
		/>
		<path
			d='M17.9231 11.3721L13.2751 16.0001L17.9231 20.6281'
			stroke={color}
			stroke-width='1.5'
			stroke-linecap='round'
			stroke-linejoin='round'
		/>
	</svg>
)

export default component
