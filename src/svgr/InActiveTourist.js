import * as React from "react"
import PropTypes from "prop-types"

const SvgComponent = ({ size, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 41}
    height={size || 40}
    fill="none"
    {...props}
  >
    <path
      fill="#FA8C16"
      d="M36.358 17.294a16.237 16.237 0 1 1-13.32-13.319 1.25 1.25 0 0 1-.412 2.466A13.761 13.761 0 0 0 6.583 20a13.69 13.69 0 0 0 3.475 9.127 12.447 12.447 0 0 1 5.634-4.493 7.5 7.5 0 1 1 9.281 0c2.28.91 4.24 2.472 5.635 4.493A13.691 13.691 0 0 0 34.083 20c0-.768-.064-1.536-.19-2.294a1.25 1.25 0 1 1 2.465-.412ZM20.333 23.75a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 10a13.683 13.683 0 0 0 8.425-2.89 10 10 0 0 0-16.85 0 13.683 13.683 0 0 0 8.425 2.89Z"
    />
    <path
      fill="#FA8C16"
      d="M30.699 13.384a1.25 1.25 0 0 0 2.134-.884V8.75a1.25 1.25 0 0 0-2.5 0v3.75c0 .332.131.65.366.884ZM30.699 5.884a1.25 1.25 0 1 0 1.768-1.768 1.25 1.25 0 0 0-1.768 1.768Z"
    />
  </svg>
)

SvgComponent.propTypes = {
  size: PropTypes.string
}
export default SvgComponent;
  