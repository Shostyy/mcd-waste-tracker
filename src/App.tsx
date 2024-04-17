import React from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import HomePage from './pages/HomePage';
import cn from 'classnames';
import Closing from './pages/Closing';
import Settings from './pages/Settings';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/complete" element={<Closing />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>

      <footer className='footer'>
        <div className='logout-block'>
          <NavLink
            to="/"
            className={({isActive}) => (cn('navigation__link', {
              'navigation__link--active': isActive,
            }))}
          >
            <DeleteIcon/>Списання
          </NavLink>
          <NavLink
            to="/complete"
            className={({isActive}) => (cn('navigation__link', {
              'navigation__link--active': isActive,
            }))}
          >
            <DeleteForeverIcon />Закриття
          </NavLink>
          <NavLink
            to="/settings"
            className={({isActive}) => (cn('navigation__link', {
              'navigation__link--active': isActive,
            }))}
          >
            <SettingsIcon />Settings
          </NavLink>
        </div>
      </footer>
    </HashRouter >
  );
}


export default App;
