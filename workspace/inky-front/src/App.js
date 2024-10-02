import logo from './logo.svg';
import './App.css';
import TestApiComponent from './components/test_api_components';

function App() {
  /*return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );*/
  return (
    <div>
      <h1>Test API</h1>
      <TestApiComponent />
    </div>
  );
}

export default App;
