import * as React from "react";


const SvgComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={8}
    fill="none"
    {...props}
  >
    <path fill="currentColor" d="M0 0h16L9.414 6.586a2 2 0 0 1-2.828 0L0 0Z" />
  </svg>
)
export default SvgComponent;
