import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { RoutePlanner } from './features/planner/RoutePlanner';
import { useAppSelector } from './app/hooks';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mode = useAppSelector(state => state.theme.mode);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  return <>{children}</>;
};

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <RoutePlanner />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
