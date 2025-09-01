import React from 'react'
import { useParams, useLocation } from 'react-router-dom'

function TestRoute() {
  const params = useParams()
  const location = useLocation()
  
  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h1>Test Route Page</h1>
      <p><strong>Current URL:</strong> {location.pathname}</p>
      <p><strong>Params:</strong> {JSON.stringify(params)}</p>
      <p><strong>Catch-all param (*):</strong> {params['*']}</p>
      <p><strong>Location:</strong> {JSON.stringify(location, null, 2)}</p>
    </div>
  )
}

export default TestRoute
