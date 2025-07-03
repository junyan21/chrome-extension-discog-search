import { render } from 'preact';
import { Options } from './components/options/Options';

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  const optionsContainer = document.getElementById('options');
  if (optionsContainer) {
    render(<Options />, optionsContainer);
  }
}