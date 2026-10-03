require('@babel/register')({
  presets: ['@babel/preset-env', ['@babel/preset-react', { runtime: 'automatic' }]],
});

const React = require('react');
const ReactDOMServer = require('react-dom/server');

const App = require('./src/App.jsx').default;
const { AuthProvider } = require('./src/lib/AuthContext.jsx');
const { CartProvider } = require('./src/lib/CartContext.jsx');

function Root() {
  return React.createElement(
    AuthProvider,
    null,
    React.createElement(
      CartProvider,
      null,
      React.createElement(App)
    )
  );
}

try {
  const html = ReactDOMServer.renderToString(React.createElement(Root));
  console.log("SUCCESS");
} catch (e) {
  console.error("ERROR CAUGHT:");
  console.error(e);
}
