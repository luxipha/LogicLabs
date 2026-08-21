import React from 'react';
import {navigate} from '../router';

export const NotFoundPage: React.FC = () => (
  <main className="not-found">
    <h1>This page is missing.</h1>
    <p>Head back to the classroom home.</p>
    <button className="primary-action" onClick={() => navigate('/')}>
      Go home
    </button>
  </main>
);
