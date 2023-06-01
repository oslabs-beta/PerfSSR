import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App.js';
import '../testing-files/style.mock.js';

jest.mock('../src/components/metricContainer', () => {
    return () => <div>Mocked MetricContainer Component</div>;
  });
  jest.mock('../src/components/HTTPReqChart', () => {
    return () => <div>Mocked HTTPReqChart Component</div>;
  });

  jest.mock('../src/components/serverComponent', () => {
    return () => <div>Mocked ServerComponent Component</div>;
  });

  jest.mock('../src/components/clientComponent', () => {
    return () => <div>Mocked ClientComponent Component</div>;
  });

  jest.mock('../src/components/benchmarkTime', () => {
    return () => <div>Mocked BenchmarkTime Component</div>;
  });

const chromeMock = {
    runtime: {
      sendMessage: jest.fn((message, callback) => {
        // Provide a dummy response 
        callback({ type: "MOCK_RESPONSE",
                   payload: '{ "example": "payload" }', 
                });
      }),
      onMessage: {
        addListener: jest.fn(),
      },
    },
    devtools: {
        inspectedWindow: {
          reload: jest.fn(),
        },
      },
  };

global.chrome = chromeMock;


test('renders the App component and intially with the button "Start PerfSSR"', () => {
    render(<App />);
    const buttonElement = screen.getByRole('button', { name: /Start PerfSSR/i });
    expect(buttonElement).toBeInTheDocument();
  });