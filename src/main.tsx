import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { store } from './app/store'
import { Toaster } from './components/ui'

/* Gündüz/gecə rejimini <html> elementinə tətbiq edir */
function applyTheme() {
  const theme = store.getState().ui.theme
  document.documentElement.classList.toggle('light', theme === 'light')
}
applyTheme()
store.subscribe(applyTheme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
