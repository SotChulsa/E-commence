import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Digipaper brand', () => {
  render(<App />);
  const brandElement = screen.getByText(/digipaper/i);
  expect(brandElement).toBeInTheDocument();
});
