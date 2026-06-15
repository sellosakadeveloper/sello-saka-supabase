import { Ticket } from './Ticket';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 overflow-auto">
      <div className="a4-page-container">
        <div className="a4-page">
          <Ticket />
        </div>
      </div>
    </div>
  );
}

export default App;
