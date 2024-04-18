import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, child } from 'firebase/database';
import { firebaseConfig } from '../firebaseConfig';
import { Tab, Tabs, Box, Alert, Button } from '@mui/material';
import { convertingValues } from '../constants/convertingValues';
import { convertingFixing } from '../constants/convertingFixing';
import ApproveByPassword from '../HOC/ApproveByPassword';

const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);

const loadPreviousDaysData = async () => {
  try {
    const currentDate = new Date();
    const dates = [];
    // Generate date strings for the last three days (including today)
    for (let i = 0; i < 3; i++) {
      const previousDate = new Date(currentDate);
      previousDate.setDate(previousDate.getDate() - i);

      const day = previousDate.toLocaleDateString('uk-UA', { day: '2-digit' });
      const month = previousDate.toLocaleDateString('uk-UA', { month: '2-digit' });

      // Iterate over both shifts for each day
      const dateString = `${day}-${month} НАПОЇ`;
      dates.push(dateString);
    }

    const previousDaysData: { date: string, data: any }[] = []; // Define the type here

    // Query Firebase for each date and process the data
    for (const date of dates) {
      const snapshot = await get(child(ref(database), `wasteItems/${date}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        previousDaysData.push({ date, data });
      } else {
        previousDaysData.push({ date, data: null });
      }
    }

    return previousDaysData;
  } catch (error) {
    console.error('Error loading previous days data:', error);
    return [];
  }
};

const TabPanel: React.FC<{
  value: number;
  index: number;
  children: React.ReactNode;
  data?: any;
}> = ({
  children,
  value,
  index,
  data,
}) => {
  const totalIngredients = calculateTotalIngredients(data);

  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`}>
      {value === index && (
        <Box p={3}>
          {children}
          <ul>
            {Object.entries(totalIngredients).map(([ingredient, amount]) => {
              const unit = convertingFixing[ingredient] ? Object.keys(convertingFixing[ingredient])[0] : '';
              const convertedAmount = convertingFixing[ingredient] ? amount / convertingFixing[ingredient][unit] : amount;
              return (
                <li key={ingredient}>
                  {`${ingredient}: ${convertedAmount.toFixed(2)} ${unit}`}
                </li>
              );
            })}
          </ul>
        </Box>
      )}
    </div>
  );
};

const calculateTotalIngredients = (data: any) => {
  const totalIngredients: { [itemName: string]: number } = {};

  for (const itemName in data) {
    const itemIngredients = convertingValues[itemName];
    if (itemIngredients) {
      for (const ingredient in itemIngredients) {
        const amount = itemIngredients[ingredient] * data[itemName];
        totalIngredients[ingredient] = (totalIngredients[ingredient] || 0) + amount;
      }
    }
  }

  return totalIngredients;
};

const loadWeekData = async (startDate: Date, endDate: Date) => {
  try {
    const dates = [];

    // Generate date strings for the provided date range
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const day = date.toLocaleDateString('uk-UA', { day: '2-digit' });
      const month = date.toLocaleDateString('uk-UA', { month: '2-digit' });
      const dateString = `${day}-${month} НАПОЇ`;
      dates.push(dateString);
    }

    const weekData: { date: string; data: any }[] = [];

    // Query Firebase for each date and process the data
    for (const date of dates) {
      const snapshot = await get(child(ref(database), `wasteItems/${date}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        weekData.push({ date, data });
      } else {
        weekData.push({ date, data: null });
      }
    }

    return weekData;
  } catch (error) {
    console.error('Error loading week data:', error);
    return [];
  }
};

const loadCurrentWeekData = async () => {
  const currentDate = new Date();
  const currentWeekStartDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1));
  const currentWeekEndDate = new Date(currentWeekStartDate);
  currentWeekEndDate.setDate(currentWeekEndDate.getDate() + 6);

  return loadWeekData(currentWeekStartDate, currentWeekEndDate);
};

const loadPreviousWeekData = async () => {
  const currentDate = new Date();
  const previousWeekStartDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() - 6));
  const previousWeekEndDate = new Date(currentDate.setDate(currentDate.getDate() - 1));

  return loadWeekData(previousWeekStartDate, previousWeekEndDate);
};

const Drinks: React.FC = () => {
  const [previousDaysData, setPreviousDaysData] = useState<any[]>([]);
  const [currentWeekData, setCurrentWeekData] = useState<any[]>([]);
  const [previousWeekData, setPreviousWeekData] = useState<any[]>([]);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    loadPreviousDaysData().then((data: { date: string; data: any }[]) => {
      setPreviousDaysData(data);
    });
  }, []);
  

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleLoadCurrentWeekData = () => {
    loadCurrentWeekData().then((data) => {
      setCurrentWeekData(data);
    });
  };

  const handleLoadPreviousWeekData = () => {
    loadPreviousWeekData().then((data) => {
      setPreviousWeekData(data);
    });
  };

  return (
    <>
      <header className="header" style={{ gap: '20px', alignItems: 'center' }}>
        <h1>Історія персональних напоїв</h1>
      </header>
      <main className="main">
        <Tabs value={tabIndex} onChange={handleTabChange}>
          {previousDaysData.map(({ date }) => (
            <Tab key={date} label={date} />
          ))}
          <Tab label="Current Week" />
          <Tab label="Previous Week" />
        </Tabs>
        {previousDaysData.map(({ date, data }, index) => (
          <TabPanel key={date} value={tabIndex} index={index} data={data}>
            <ul>
              {data ? Object.entries(data).map(([itemName, itemData]) => (
                <li key={itemName} style={{
                  backgroundColor: itemName.includes('RW') ? '#E1EDFE' : '#E8FFE8',
                }}>
                  <label>
                    {`${itemName}: ${itemData}`}
                  </label>
                </li>
              )) : (
                <Alert severity="warning">Відсутні дані за обраний період</Alert>
              )}
            </ul>
          </TabPanel>
        ))}
        <TabPanel value={tabIndex} index={previousDaysData.length}>
          <Button variant="contained" onClick={handleLoadCurrentWeekData}>Load Current Week Data</Button>
          {currentWeekData.map(({ date, data }, index) => (
            <TabPanel key={date} value={tabIndex} index={previousDaysData.length} data={data}>
              <h2>{date}</h2>
              <ul>
                {data ? Object.entries(data).map(([itemName, itemData]) => (
                  <li key={itemName} style={{
                    backgroundColor: itemName.includes('RW') ? '#E1EDFE' : '#E8FFE8',
                  }}>
                    <label>
                      {`${itemName}: ${itemData}`}
                    </label>
                  </li>
                )) : (
                  <Alert severity="warning">Відсутні дані за обраний період</Alert>
                )}
              </ul>
            </TabPanel>
          ))}
        </TabPanel>
        <TabPanel value={tabIndex} index={previousDaysData.length + 1}>
          <Button variant="contained" onClick={handleLoadPreviousWeekData}>Load Previous Week Data</Button>
          {previousWeekData.map(({ date, data }, index) => (
            <TabPanel key={date} value={tabIndex} index={previousDaysData.length + 1} data={data}>
              <h2>{date}</h2>
              <ul>
                {data ? Object.entries(data).map(([itemName, itemData]) => (
                  <li key={itemName} style={{
                    backgroundColor: itemName.includes('RW') ? '#E1EDFE' : '#E8FFE8',
                  }}>
                    <label>
                      {`${itemName}: ${itemData}`}
                    </label>
                  </li>
                )) : (
                  <Alert severity="warning">Відсутні дані за обраний період</Alert>
                )}
              </ul>
            </TabPanel>
          ))}
        </TabPanel>
      </main>
    </>
  );
};

export default ApproveByPassword(Drinks);
