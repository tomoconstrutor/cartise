import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './styles.css';

const root = document.getElementById('root');
const app = <React.StrictMode><App pathname={window.location.pathname} /></React.StrictMode>;
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
