import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/Homepage';
import TravelDiaryPage from './pages/TravelDiaryPage';
import SchedulePage from './pages/SchedulePage';
import CreateTravelPlanPage from './pages/CreateTravelPlanPage';
import NewSchedulePage from './pages/CreateSchedulePage';
import SelectPlacePage from './pages/SelectPlacePage';
import { APIProvider } from '@vis.gl/react-google-maps';
import { DragDropContext } from 'react-beautiful-dnd';

const App: React.FC = () => {
  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_KEY} onLoad={() => console.log('Maps API has loaded.')}>
      <DragDropContext>
      <Router>
        <Routes>
          <Route path="/" Component={HomePage} />
          <Route path="/travelPlans/:id" Component={TravelDiaryPage} />
          <Route path="/create-travel-plan" Component={CreateTravelPlanPage} />
          <Route path="/travel-diary/:id/new-schedule" Component={NewSchedulePage} />
          <Route path="/travelPlans/schedules/:id" Component={SchedulePage} />
          <Route path="/places-map" Component={SelectPlacePage} /> {/* Add the new route */}
        </Routes>
      </Router>
      </DragDropContext>
    </APIProvider>
  );
};

export default App;
