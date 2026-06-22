import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './tailwind.css';

// Ensure root element fills the viewport
const rootElement = document.getElementById('root')!;
rootElement.style.width = '100vw';
rootElement.style.height = '100vh';
rootElement.style.overflow = 'hidden';
rootElement.style.margin = '0';
rootElement.style.padding = '0';

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
