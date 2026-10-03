require('@babel/register')({
  presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]],
});

const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { MemoryRouter, Route, Routes } = require('react-router-dom');

const Restaurant = require('./src/pages/Restaurant.jsx').default;
const { CartProvider } = require('./src/lib/CartContext.jsx');

function App() {
  return React.createElement(
    MemoryRouter,
    { initialEntries: ['/restaurant/lee-restaurant-dhaba'] },
    React.createElement(
      CartProvider,
      null,
      React.createElement(
        Routes,
        null,
        React.createElement(Route, { path: "/restaurant/:id", element: React.createElement(Restaurant) })
      )
    )
  );
}

try {
  const html = ReactDOMServer.renderToString(React.createElement(App));
  console.log("SUCCESS");
} catch (e) {
  console.error("ERROR CAUGHT:");
  console.error(e);
}
