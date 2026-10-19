import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/* `#app { display: contents }` in styles/pixelio.css keeps every section a
   layout child of <body>, exactly like the original page. */
createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
