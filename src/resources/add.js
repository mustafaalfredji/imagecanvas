const component = ({ color }) => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			d='M3.49994 20.5004C4.32994 21.3304 5.66994 21.3304 6.49994 20.5004L19.4999 7.50043C20.3299 6.67043 20.3299 5.33043 19.4999 4.50043C18.6699 3.67043 17.3299 3.67043 16.4999 4.50043L3.49994 17.5004C2.66994 18.3304 2.66994 19.6704 3.49994 20.5004Z'
			stroke={color}
			stroke-width='1.5'
			stroke-linecap='round'
			stroke-linejoin='round'
		/>
		<path
			d='M18.01 8.99023L15.01 5.99023'
			stroke={color}
			stroke-width='1.5'
			stroke-linecap='round'
			stroke-linejoin='round'
		/>
		<path
			d='M8.5 2.44L10 2L9.56 3.5L10 5L8.5 4.56L7 5L7.44 3.5L7 2L8.5 2.44Z'
			stroke={color}
			stroke-linecap='round'
			stroke-linejoin='round'
		/>
		<path
			d='M4.5 8.44L6 8L5.56 9.5L6 11L4.5 10.56L3 11L3.44 9.5L3 8L4.5 8.44Z'
			stroke={color}
			stroke-linecap='round'
			stroke-linejoin='round'
		/>
		<path
			d='M19.5 13.44L21 13L20.56 14.5L21 16L19.5 15.56L18 16L18.44 14.5L18 13L19.5 13.44Z'
			stroke={color}
			stroke-linecap='round'
			stroke-linejoin='round'
		/>
	</svg>
)

export default component
