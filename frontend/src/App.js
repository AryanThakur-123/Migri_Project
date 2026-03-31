import React from 'react';
import Dashboard from './pages/Dashboard';

function App() {
  // Using your Test Pro Tenant ID from yesterday
  const testTenantId = "eeee-ffff-aaaa-bbbb-cccc-dddd00000001";

  return (
    <div className="App">
      <Dashboard tenantId={testTenantId} />
    </div>
  );
}

export default App; // This line fixes the "default export" error!

// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
