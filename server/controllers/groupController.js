import { store } from '../services/store.js';

export const getUserGroups = async (req, res, next) => {
  try {
    const groups = store.getUserGroups(req.user._id);
    res.json({ success: true, groups });
  } catch (error) {
    next(error);
  }
};

export const getGroupDetails = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const group = store.getGroupById(groupId, req.user._id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }
    res.json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Group name must be at least 2 characters.' });
    }

    const group = store.createGroup(name.trim(), description, image, req.user._id);
    res.status(201).json({ success: true, group, message: 'Group created successfully.' });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { userId, role = 'member' } = req.body;

    const group = store.getGroupById(groupId, req.user._id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    if (!group.isMember) {
      return res.status(403).json({ success: false, message: 'You must be a member of this group to invite others.' });
    }

    const targetUser = store.getUserById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found.' });
    }

    const member = store.addGroupMember(groupId, userId, role);
    store.createNotification({
      recipientId: userId,
      senderId: req.user._id,
      type: 'group_invitation',
      title: `Added to ${group.name}`,
      message: `${req.user.username} added you to group "${group.name}".`,
      link: `/groups/${groupId}`,
    });

    res.json({ success: true, member, message: `Added ${targetUser.username} to group.` });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { targetUserId, newRole } = req.body;

    const group = store.getGroupById(groupId, req.user._id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found.' });

    if (group.currentUserRole !== 'owner' && group.currentUserRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only owners or admins can change member roles.' });
    }

    const updated = store.updateMemberRole(groupId, targetUserId, newRole);
    res.json({ success: true, member: updated, message: 'Role updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { groupId, userId } = req.params;
    const group = store.getGroupById(groupId, req.user._id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found.' });

    // Allow user to leave themselves, or owner/admin to remove
    const isSelf = userId === req.user._id;
    const isPrivileged = group.currentUserRole === 'owner' || group.currentUserRole === 'admin';

    if (!isSelf && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Unauthorized to remove this member.' });
    }

    store.removeGroupMember(groupId, userId);
    res.json({ success: true, message: isSelf ? 'You have left the group.' : 'Member removed.' });
  } catch (error) {
    next(error);
  }
};
