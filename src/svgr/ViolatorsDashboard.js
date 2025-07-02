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
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.3}
      d="M7.537 23.735v-1.781c0-.845.687-1.53 1.535-1.53h3.517c.848 0 1.535.685 1.535 1.53v1.78H7.537ZM10.83 20.424a2.359 2.359 0 0 1-2.358-2.359v-.401a2.358 2.358 0 1 1 4.717 0v.401a2.359 2.359 0 0 1-2.358 2.359Z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.3}
      d="M16.42 28.152H4.468V5.074h19.09V15.71M19 10H8"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.3}
      d="m15.83 25.941 5.438-9.538a1.46 1.46 0 0 1 2.536 0l5.439 9.538c.553.97-.15 2.174-1.268 2.174H17.097c-1.118 0-1.82-1.204-1.268-2.174ZM22.59 21.161v1.959"
    />
    <circle cx={22.591} cy={25.435} r={0.601} fill="currentColor" />
  </svg>
)

SvgComponent.propTypes = {
  size: PropTypes.number
}

export default SvgComponent
  