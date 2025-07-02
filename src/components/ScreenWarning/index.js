import React from 'react'


function ScreenWarning() {
  return (
    <div className="screen-warning">
      <div id="rotate-container"></div>
      <div>
        <div style={{ textAlign: 'center', color: "white", marginTop: '50px', padding: "24px" }}>
          <h1 style={{ color: 'white', lineHeight: "34px" }}>Screen resolution not supported</h1>
          <p>Please use a screen resolution of width 375px at least.</p>
        </div>
      </div>
    </div>
  )
}

export default ScreenWarning;