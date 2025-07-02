import PropTypes from "prop-types"
import * as React from "react"


const SvgComponent = ({ size, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 32}
    height={size || 32}
    viewBox="0 0 32 32"
    fill="none"
    {...props}
  >
    <path
      fill="currentColor"
      fillOpacity={0.88}
      stroke="currentColor"
      strokeOpacity={0.88}
      strokeWidth={0.6}
      d="M16.47 18.933a7.296 7.296 0 1 1 .002-14.593 7.296 7.296 0 0 1-.002 14.593Zm0-13.913a6.623 6.623 0 1 0 .013 13.247A6.623 6.623 0 0 0 16.47 5.02Z"
    />
    <path
      fill="currentColor"
      fillOpacity={0.88}
      stroke="currentColor"
      strokeOpacity={0.88}
      strokeWidth={0.6}
      d="M21.393 7.053a.334.334 0 0 1-.236-.096.334.334 0 0 1 0-.47L27.213.43a.335.335 0 0 1 .474.473l-6.06 6.054a.333.333 0 0 1-.234.096Z"
    />
    <path
      fill="currentColor"
      fillOpacity={0.88}
      stroke="currentColor"
      strokeOpacity={0.88}
      strokeWidth={0.6}
      d="M27.334 4.42A.333.333 0 0 1 27 4.087L27.104 1l-3.064.113a.333.333 0 1 1 0-.666l3.397-.114a.333.333 0 0 1 .346.347l-.116 3.42a.334.334 0 0 1-.334.32ZM11.513 23.103a7.293 7.293 0 1 1 7.297-7.293 7.304 7.304 0 0 1-7.297 7.293Zm0-13.92a6.627 6.627 0 1 0 6.63 6.627 6.637 6.637 0 0 0-6.63-6.627Z"
    />
    <path
      fill="currentColor"
      fillOpacity={0.88}
      stroke="currentColor"
      strokeOpacity={0.88}
      strokeWidth={0.6}
      d="M11.513 31.667a.333.333 0 0 1-.333-.334V22.77a.333.333 0 0 1 .667 0v8.563a.333.333 0 0 1-.334.334Z"
    />
    <path
      fill="currentColor"
      fillOpacity={0.88}
      stroke="currentColor"
      strokeOpacity={0.88}
      strokeWidth={0.6}
      d="M13.843 29.16H9.177a.333.333 0 1 1 0-.667h4.666a.333.333 0 0 1 0 .667Z"
    />
  </svg>
)

SvgComponent.propTypes = {
  size: PropTypes.number
}
export default SvgComponent
