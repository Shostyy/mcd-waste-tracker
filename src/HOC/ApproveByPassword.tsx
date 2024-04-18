import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MNG_PASSWORD } from '../constants/constants';

const ApproveByPassword = (WrappedComponent: React.FC<any>) => {
  const WrappedWithAuthorization: React.FC<any> = (props) => {
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isPasswordIncorrect, setIsPasswordIncorrect] = useState(false);

    const handleClose = () => {
      navigate('/');
    };

    const handleButtonClick = () => {
      if (inputValue === MNG_PASSWORD) {
        setIsAuthorized(true);
      } else {
        setIsPasswordIncorrect(true);
      }
    }

    const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);
    }

    const handleTextFieldKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleButtonClick();
      }
    };

    return (
      <>
        {isAuthorized ? (
          <WrappedComponent {...props} />
        ) : (
          <Dialog open={!isAuthorized} onClose={handleClose}>
            <DialogTitle>Введіть пароль менеджера</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Пароль"
                type="password"
                fullWidth
                value={inputValue}
                onChange={handleChangeInput}
                onKeyDown={handleTextFieldKeyPress}
              />
            </DialogContent>
            {isPasswordIncorrect && (<Alert severity="error">Невірний пароль</Alert>)}
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Повернутись
              </Button>
              <Button onClick={handleButtonClick} color="primary">
                Авторизуватись
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </>
    );
  };

  return WrappedWithAuthorization; // Return the new component with added authorization functionality
};

export default ApproveByPassword;
