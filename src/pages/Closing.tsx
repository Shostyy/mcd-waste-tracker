import React, { useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child, remove, set } from 'firebase/database';
import { firebaseConfig } from '../firebaseConfig';
import { Checkbox, Button, Tab, Tabs, Box, Alert } from '@mui/material';

const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);

const TabPanel: React.FC<{ value: number, index: number, children: React.ReactNode }> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`}>
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
};

const moveItemToWastedState = async (date: string, itemName: string) => {
  try {
    const itemPath = `wasteItems/${date}/${itemName}`;
    const wastedItemPath = `wasteItems/${date}/${itemName}--wasted`;

    // Check if the item is already in the wasted state
    const wastedSnapshot = await get(child(ref(database), wastedItemPath));
    const wastedAmount = wastedSnapshot.exists() ? wastedSnapshot.val() : 0;

    // Get the current amount of the item
    const snapshot = await get(child(ref(database), itemPath));
    if (snapshot.exists()) {
      const originalAmount = snapshot.val();
      const totalAmount = originalAmount + wastedAmount;

      // Remove the item from the original state
      await remove(ref(database, itemPath));

      // Add the total amount to the "wasted" state
      await set(ref(database, wastedItemPath), totalAmount);

      console.log(`Amount of "${itemName}" moved to "wasted" state successfully`);
    } else {
      console.log(`Item "${itemName}" does not exist`);
    }
  } catch (error) {
    console.error(`Error moving amount of "${itemName}" to "wasted" state:`, error);
  }
};

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
      for (let shift = 1; shift <= 2; shift++) {
        const shiftLabel = shift === 1 ? '1SH' : '2SH';
        const dateString = `${day}-${month} ${shiftLabel}`;
        dates.push(dateString);
      }
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

const Closing: React.FC = () => {
  const [previousDaysData, setPreviousDaysData] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [itemName: string]: boolean }>({});
  const [tabIndex, setTabIndex] = useState(0);
  const [selectAllText, setSelectAllText] = useState('Обрати всі');

  useEffect(() => {
    loadPreviousDaysData().then((data) => {
      setPreviousDaysData(data);
    });
  }, []);

  const handleItemClick = (itemName: string) => {
    setSelectedItems(prevState => ({
      ...prevState,
      [itemName]: !prevState[itemName]
    }));
  };

  const handleMoveSelectedItems = async (date: string) => {
    // Iterate over selected items and move them to wasted state
    for (const itemName in selectedItems) {
      if (selectedItems[itemName]) {
        await moveItemToWastedState(date, itemName);
      }
    }

    setSelectedItems({});

    // Reload data after move operation is complete
    const updatedData = await loadPreviousDaysData();
    setPreviousDaysData(updatedData);
  };

  const handleSelectAll = () => {
    const allSelected = previousDaysData.every(({ data }) => {
      if (!data) return true;
      return Object.keys(data).every(itemName => !itemName.includes('--wasted') && selectedItems[itemName]);
    });
  
    const allItems: { [itemName: string]: boolean } = {};
    previousDaysData.forEach(({ data }) => {
      if (!data) return;
      Object.keys(data).forEach(itemName => {
        if (!itemName.includes('--wasted')) {
          allItems[itemName] = !allSelected;
        }
      });
    });
  
    setSelectedItems(allItems);
    setSelectAllText(allSelected ? 'Обрати всі' : 'Скасувати вибір');
  };



  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <>
      <header className="header" style={{ gap: '20px', alignItems: 'center' }}>
        <h1>Історія списання</h1>
        <ul className="info-list">
          <li className='info-item'>Списано RW - <div className="color color--rw-com"></div></li>
          <li className='info-item'>Списано CW - <div className="color color--cw-com"></div></li>
          <li className='info-item'>Очікує RW - <div className="color color--rw-wai"></div></li>
          <li className='info-item'>Очікує CW - <div className="color color color--cw-wai"></div></li>
        </ul>
      </header>
      <main className="main">
        <Tabs value={tabIndex} onChange={handleTabChange}>
          {previousDaysData.map(({ date }) => (
            <Tab key={date} label={date} />
          ))}
        </Tabs>
        {previousDaysData.map(({ date, data }, index) => (
          <TabPanel key={date} value={tabIndex} index={index}>
            <ul>
              {/* Render wasted items */}
              {data && Object.entries(data).map(([itemName, itemData]) => (
                itemName.includes('--wasted') && (
                  <li
                    key={itemName}
                    style={{
                      backgroundColor: itemName.includes('RW') ? '#74B0FF' : 'lightgreen'
                    }}
                  >
                    {`${itemName.replace('--wasted', '')}: ${itemData}`}
                  </li>
                )
              ))}
              {/* Render other items */}
              {data ? Object.entries(data).map(([itemName, itemData]) => (
                !itemName.includes('--wasted') && (
                  <li key={itemName} style={{
                    backgroundColor: itemName.includes('RW') ? '#E1EDFE' : '#E8FFE8',
                  }}>
                    <label>
                      <Checkbox
                        checked={selectedItems[itemName] || false}
                        onChange={() => handleItemClick(itemName)}
                      />
                      {`${itemName}: ${itemData}`}
                    </label>
                  </li>
                )
              )) : (
                <Alert severity="warning">Відсутні дані за обраний період</Alert>
              )}
            </ul>
            {data && (
              <div className='complete-actions'>
                <Button
                  variant='contained'
                  disabled={!data || Object.keys(selectedItems).filter(itemName => !itemName.includes('--wasted')).length === 0}
                  onClick={() => handleMoveSelectedItems(date)}
                >
                  Списати обрані продукти
                </Button>
                <Button
                  variant='contained'
                  onClick={handleSelectAll}
                  disabled={
                    data ?
                      !Object.entries(data).some(([itemName]) => !itemName.includes('--wasted'))
                      :
                      true
                  }
                >
                  {selectAllText}
                </Button>
              </div>
            )}

          </TabPanel>
        ))}
      </main>
    </>
  );
};

export default Closing;
