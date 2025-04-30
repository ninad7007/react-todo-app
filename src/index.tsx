import React from 'react';
import ReactDOM from 'react-dom/client';
import ListGroup from './components/ListGroup';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ListGroup />
  </React.StrictMode>
); 