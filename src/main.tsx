import { render } from 'preact';
import { App } from './components/popup/App';
import './style.css';

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  const appContainer = document.getElementById('app');
  if (appContainer) {
    render(<App />, appContainer);
  }
}