import { store } from '../services/store.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = store.getUserNotifications(req.user._id);
    res.json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const { notifId } = req.params;
    const notif = store.markNotificationAsRead(notifId, req.user._id);
    res.json({ success: true, notification: notif });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    store.markAllNotificationsRead(req.user._id);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

export const globalSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = store.searchAll(q || '', req.user._id);
    res.json({ success: true, results });
  } catch (error) {
    next(error);
  }
};
