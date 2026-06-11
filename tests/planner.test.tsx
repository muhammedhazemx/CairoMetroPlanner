import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/App';

// Mock react-leaflet to prevent jsdom Leaflet errors
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="mock-map-container">{children}</div>,
  TileLayer: () => <div data-testid="mock-tile-layer" />,
  Polyline: ({ positions, pathOptions }: any) => (
    <div
      data-testid="mock-polyline"
      data-positions={JSON.stringify(positions)}
      data-color={pathOptions?.color}
    />
  ),
  CircleMarker: ({ center, children }: any) => (
    <div data-testid="mock-circle-marker" data-center={JSON.stringify(center)}>
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="mock-popup">{children}</div>,
  useMap: () => ({
    fitBounds: vi.fn(),
    setView: vi.fn()
  })
}));

vi.mock('leaflet', () => ({
  default: {
    latLngBounds: () => ({
      extend: () => {},
      pad: () => {}
    })
  },
  latLngBounds: () => ({
    extend: () => {},
    pad: () => {}
  })
}));

describe('Cairo Metro Route Planner Integration Flow', () => {
  it('renders headers, picks and switches languages', () => {
    render(<App />);

    // Check title renders in English by default
    expect(screen.getByText('Cairo Metro Route Planner')).toBeInTheDocument();
    expect(screen.getByText("Find the quickest route across Cairo's metro network")).toBeInTheDocument();

    // Toggle language to Arabic
    const langBtn = screen.getByRole('button', { name: /Switch to Arabic/i });
    fireEvent.click(langBtn);

    // Verify Arabic translations are active
    expect(screen.getByText('مخطط مسار مترو القاهرة')).toBeInTheDocument();

    // Toggle back to English
    const langBtnAr = screen.getByRole('button', { name: /تغيير اللغة إلى الإنجليزية/i });
    fireEvent.click(langBtnAr);
    expect(screen.getByText('Cairo Metro Route Planner')).toBeInTheDocument();
  });

  it('allows selecting origin and destination to plan a route, then swapping them', async () => {
    render(<App />);

    const originInput = screen.getByPlaceholderText('Select Origin Station');
    fireEvent.focus(originInput);

    // Wait for dropdown to open using ARIA expanded attribute
    await waitFor(() => {
      expect(originInput).toHaveAttribute('aria-expanded', 'true');
    });

    // Select "Helwan" from the options by its direct LI ID
    const helwanOption = document.getElementById('origin-option-10_HLW_METRO');
    expect(helwanOption).not.toBeNull();
    fireEvent.click(helwanOption!);

    // Wait for dropdown to close and value placeholder to update to station name
    await waitFor(() => {
      expect(originInput).toHaveAttribute('aria-expanded', 'false');
      expect(originInput).toHaveAttribute('placeholder', 'Helwan');
    });

    const destInput = screen.getByPlaceholderText('Select Destination Station');
    fireEvent.focus(destInput);

    // Wait for dropdown to open
    await waitFor(() => {
      expect(destInput).toHaveAttribute('aria-expanded', 'true');
    });

    // Select "Maadi" from the options
    const maadiOption = document.getElementById('destination-option-23_MAD_METRO');
    expect(maadiOption).not.toBeNull();
    fireEvent.click(maadiOption!);

    // Wait for dropdown to close and value placeholder to update
    await waitFor(() => {
      expect(destInput).toHaveAttribute('aria-expanded', 'false');
      expect(destInput).toHaveAttribute('placeholder', 'Maadi');
    });

    // Verify route calculations appear (Helwan -> Maadi is 10 stops, 12 EGP fare, 20 mins)
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // total stops
      expect(screen.getByText('12')).toBeInTheDocument();  // ticket fare (EGP)
      expect(screen.getByText('20')).toBeInTheDocument(); // estimated time (mins)
    });

    // Verify path timeline exists
    expect(screen.getByText('Route Details')).toBeInTheDocument();

    // Click Swap button
    const swapBtn = screen.getByRole('button', { name: /Swap Origin & Destination/i });
    fireEvent.click(swapBtn);

    // Inputs should swap, verify they updated
    await waitFor(() => {
      expect(originInput).toHaveAttribute('placeholder', 'Maadi');
      expect(destInput).toHaveAttribute('placeholder', 'Helwan');
    });
  });
});
