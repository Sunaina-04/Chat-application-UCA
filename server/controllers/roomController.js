import { store } from '../services/store.js';

export const getRoomsByGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const group = store.getGroupById(groupId, req.user._id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found.' });

    if (!group.isMember) {
      return res.status(403).json({ success: false, message: 'You must be a member of this group to view rooms.' });
    }

    const rooms = store.getGroupRooms(groupId);
    res.json({ success: true, rooms });
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { name, description, visibility = 'public' } = req.body;

    const group = store.getGroupById(groupId, req.user._id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found.' });

    if (!group.isMember) {
      return res.status(403).json({ success: false, message: 'You must be a group member to create a room.' });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Room name must be at least 2 characters.' });
    }

    const room = store.createRoom(groupId, name, description, visibility, req.user._id);
    res.status(201).json({ success: true, room, message: `Room #${room.name} created!` });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const { groupId, roomId } = req.params;
    const group = store.getGroupById(groupId, req.user._id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found.' });

    const isPrivileged = group.currentUserRole === 'owner' || group.currentUserRole === 'admin';
    if (!isPrivileged) {
      return res.status(403).json({ success: false, message: 'Only group owners or admins can delete rooms.' });
    }

    store.deleteRoom(roomId, req.user._id);
    res.json({ success: true, message: 'Room deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
