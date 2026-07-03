import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Ask the browser to keep our localStorage data around. iOS is aggressive
// about evicting non-persistent storage, so request persistence once at
// startup. Guarded because not every browser supports the API.
if (navigator.storage?.persist) {
  navigator.storage
    .persist()
    .then((granted) =>
      console.log(`Persistent storage ${granted ? 'granted' : 'denied'}`),
    )
    .catch((err) => console.log('Persistent storage request failed:', err))
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
