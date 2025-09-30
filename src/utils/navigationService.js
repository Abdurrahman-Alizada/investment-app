// navigationService.js
import { navigationRef } from './App';
import { CommonActions } from '@react-navigation/native';

export const navigate = (name, params) => {
  navigationRef.current?.navigate(name, params);
};

export const resetToLogin = () => {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    })
  );
};