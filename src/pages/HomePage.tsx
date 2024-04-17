import React, { useEffect, useState } from 'react';
import '../App.css';
import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';
import cn from 'classnames';
import { firebaseConfig } from '../firebaseConfig';
import { saveWasteItemToFirebase } from '../utils/saveWasteItemToFirebase';
import {
  AMOUNTS,
  CATEGORIES,
  CATEGORIES_IMAGES,
  GOOGLE_API_KEY,
  GOOGLE_SHEET_ID,
  GOOGLE_SHEET_SELECTION_RANGE,
  RW_CATEGORY_ID
} from '../constants/constants';
import { WasteItem } from '../types/WasteItem';
import { fetchCategoriesData } from '../utils/fetchCategoriesData';

const firebase = initializeApp(firebaseConfig);
const database = getDatabase(firebase);

function HomePage() {
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [wasteList, setWasteList] = useState<WasteItem[]>([]);
  const [menuItems, setMenuItems] = useState<[][] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchCategoriesData(CATEGORIES, GOOGLE_SHEET_SELECTION_RANGE, GOOGLE_SHEET_ID, GOOGLE_API_KEY)
      .then((res: [][] | null) => {
        setMenuItems(res);
      })
      .catch(err => console.log(err));
  }, []);


  const handleAddSelectedAmount = (amount: string) => {
    const newAmount = selectedAmount + amount;
    setSelectedAmount(newAmount);
  }

  const handleClearSelectedAmount = () => {
    setSelectedAmount('');
  }

  const handleAddToList = (product: string) => {
    setSaveErrorMessage(null);
    setSaveSuccessMessage(null);
    const amountToAdd = selectedAmount === '' ? 1 : +selectedAmount;
    const modifiedProduct = selectedCategory === RW_CATEGORY_ID ? `RW-${product}` : product;

    const existingItemIndex = wasteList.findIndex(item => item.product === modifiedProduct);

    if (existingItemIndex !== -1) {
      setWasteList(prevList => {
        const updatedList = prevList.map((item, index) => {
          if (index === existingItemIndex) {
            return { ...item, amount: item.amount + amountToAdd };
          }
          return item;
        });
        return updatedList;
      });
    } else {
      setWasteList(prevList => [...prevList, { product: modifiedProduct, amount: amountToAdd }]);
    }

    setSelectedAmount('');
  };


  const handleSaveToDatabase = async () => {
    setSaveErrorMessage(null);
    setSaveSuccessMessage(null);
    setIsSaving(true);

    try {
      const currentDate = new Date();
      const currentDay = currentDate.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }).replace(/\./g, '-');
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();
      let shift;

      if ((currentHour < 14 && currentHour >= 5) || (currentHour === 14 && currentMinute < 30)) {
        shift = "1SH";
      } else {
        shift = "2SH";
      }

      let errorOccurred = false;

      for (const wasteItem of wasteList) {
        try {
          const result = `${currentDay} ${shift}`;
          await saveWasteItemToFirebase(database, result, { [wasteItem.product]: wasteItem.amount });
          console.log(`Waste item "${wasteItem.product}" saved to Firebase successfully`);
        } catch (error) {
          setSaveErrorMessage('Немає зєднання з Інтернетом. Перевірте підключення та спробуйте ще раз.');
          errorOccurred = true;
        }
      }

      if (!errorOccurred) {
        setTimeout(() => {
          setSaveSuccessMessage('Дані збережені успішно');
        }, 250);
        setTimeout(() => {
          setSaveSuccessMessage(null);
        }, 5000);
      }
    } catch (error) {
      setSaveErrorMessage('Сталася помилка під час збереження даних');

      setTimeout(() => {
        setSaveErrorMessage(null);
      }, 10000);
    } finally {
      setTimeout(() => {
        setWasteList([]);
        setSelectedAmount('');
        setIsSaving(false);
      }, 250);
    }
  };




  return (
    <>
      <header className='header'>
        <div className='selected-amount' onClick={handleClearSelectedAmount}>
          <Paper
            elevation={3}
            sx={{
              width: '100px',
              height: '100px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Кількість
            </Typography>
            <Typography variant="h4" component="p">
              {selectedAmount}
            </Typography>
          </Paper>
        </div>
        <div className='waste'>

          {wasteList && !!wasteList.length && (
            <>
              <Typography variant="h6" gutterBottom>
                Списано:
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setWasteList([])}
                  sx={{
                    marginTop: '20px',
                    fontSize: '16px',
                    height: '50px',
                    width: '120px',
                  }}
                >
                  Очистити
                </Button>
              </Typography>
              <ul className="waste-list">
                {wasteList.map(wasteItem => (
                  <li key={wasteItem.product} className="waste-item">
                    {`${wasteItem.product}: ${wasteItem.amount}`}
                  </li>
                ))}
              </ul>
            </>
          )}
          {saveSuccessMessage && (
            <Alert variant="outlined" severity="success">
              {saveSuccessMessage}
            </Alert>
          )}
          {saveErrorMessage && (
            <Alert variant="outlined" severity="error">
              {saveErrorMessage}
            </Alert>
          )}
        </div>
        <div className='save-button-wrapper'>
          {!!wasteList.length && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              sx={{
                marginTop: '20px',
                fontSize: '16px',
                height: '50px',
                width: '140px',
              }}
            >
              {isSaving ? <CircularProgress size={24} /> : 'Зберегти'}
            </Button>
          )}
        </div>
      </header>

      <main className='main'>
        <div className='amount-wrapper'>
          {AMOUNTS.map((item) => (
            <button
              className='amount-button'
              onClick={() => handleAddSelectedAmount(item)}
              key={item}
            >
              {item}
            </button>
          ))}
          {selectedCategory === RW_CATEGORY_ID && (
            <button
              className='amount-button'
              onClick={() => handleAddSelectedAmount('.')}
            >
              {'.'}
            </button>
          )}
        </div>

        <ul className='categories-list'>
          {CATEGORIES.map((item, index) => (
            <li
              onClick={() => setSelectedCategory(index)}
              className={cn('categories-item', {
                'categories-item--active': index === selectedCategory,
              })}
              key={item}
            >
              <img
                src={CATEGORIES_IMAGES[index]}
                alt={item}
                className='categories-image'
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="products">
          {!menuItems ? (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <ul className="product-list">
              {menuItems[selectedCategory] && menuItems[selectedCategory].map(product => (
                <li className="product-item" key={product[0]} onClick={() => handleAddToList(product[0])}>
                  <img src={product[1]} alt={product[0]} className="product-item__image" />
                  <span className="product-item__title">
                    {product[0]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main >
    </>
  );
}

export default HomePage;
