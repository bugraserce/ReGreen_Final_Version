import React, { createContext, useContext, useEffect, useState } from 'react';
import { userContext } from '../App';

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children }) => {
  const userInformation = useContext(userContext);
  const userId = userInformation.id;

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Retrieve notifications from localStorage based on userId when the component mounts
    const storedNotifications = localStorage.getItem(`notifications_${userId}`);
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, [userId]); // Run whenever userId changes

  const addNotification = (notification) => {
    setNotifications((prevNotifications) => [...prevNotifications, notification]);
  };

  const updateNotifications = (updatedNotifications) => {
    setNotifications(updatedNotifications);
};



  const removeNotification = (index) => {
    const updatedNotifications = [...notifications];
    updatedNotifications.splice(index, 1);
    setNotifications(updatedNotifications);
};

  return (
    <NotificationsContext.Provider value={{ notifications, addNotification, removeNotification,updateNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
