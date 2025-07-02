import * as React from "react"


const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    viewBox="0 0 18 18"
    {...props}
  >
    <path fill="#fff" d="M0 0h16v16H0z" />
    <rect
      width={15}
      height={15}
      x={0.5}
      y={0.5}
      fill="#B68A35"
      stroke="#D1B580"
      rx={1.5}
    />
    <path stroke="#fff" d="M8 3.2v9.6M12.8 8H3.2" />
  </svg>
)

export default SvgComponent
