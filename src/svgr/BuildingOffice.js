import PropTypes from "prop-types"
import * as React from "react"

const SvgComponent = ({ size, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 256"
    width={size || 32}
    height={size || 32}
    {...props}
  >
    <path fill="none" d="M0 0h256v256H0z" />
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={16}
      d="M24 216h224M48 40v176M176 216V40M224 216V88M80 80h16M128 80h16M80 120h16M128 120h16M88 216v-56h48v56M40 40h144M176 88h56"
    />
  </svg>
)

SvgComponent.propTypes = {
  size: PropTypes.string
}
export default SvgComponent;
