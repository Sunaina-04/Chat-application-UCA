import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

class DataStore {
  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.groups = new Map();
    this.groupMembers = new Map(); // key: `${groupId}:${userId}`
    this.rooms = new Map();
    this.messages = new Map();
    this.notifications = new Map();
    this.onlineUsers = new Set(); // set of userIds

    this.initDemoData();
  }

  async initDemoData() {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('demo123', salt);

    // 1. Pre-seeded Users
    const demoUsers = [
      {
        _id: 'user_soham',
        username: 'Soham',
        email: 'soham@chatspace.dev',
        passwordHash,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: 'Full-Stack Dev & System Architect',
        status: 'online',
        lastSeen: new Date(),
        createdAt: new Date(Date.now() - 30 * 24 * 3600000),
      },
      {
        _id: 'user_rahul',
        username: 'Rahul',
        email: 'rahul@chatspace.dev',
        passwordHash,
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        bio: 'Competitive Programmer & Graph Theory geek',
        status: 'online',
        lastSeen: new Date(),
        createdAt: new Date(Date.now() - 28 * 24 * 3600000),
      },
      {
        _id: 'user_aman',
        username: 'Aman',
        email: 'aman@chatspace.dev',
        passwordHash,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        bio: 'Backend & Distributed Systems Wizard',
        status: 'away',
        lastSeen: new Date(Date.now() - 15 * 60000),
        createdAt: new Date(Date.now() - 25 * 24 * 3600000),
      },
      {
        _id: 'user_priya',
        username: 'Priya',
        email: 'priya@chatspace.dev',
        passwordHash,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        bio: 'Product Designer & UI/UX Specialist',
        status: 'offline',
        lastSeen: new Date(Date.now() - 45 * 60000),
        createdAt: new Date(Date.now() - 20 * 24 * 3600000),
      },
    ];

    demoUsers.forEach(u => this.users.set(u._id, u));
    this.onlineUsers.add('user_soham');
    this.onlineUsers.add('user_rahul');

    // 2. Pre-seeded Groups
    const groupCollegeCSE = {
      _id: 'group_college_cse',
      name: 'College CSE',
      description: 'Department of Computer Science & Engineering - Batch 2026',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
      ownerId: 'user_soham',
      settings: { allowMemberRoomCreation: true, allowMemberInvites: true },
      createdAt: new Date(Date.now() - 20 * 24 * 3600000),
    };

    const groupOpenSource = {
      _id: 'group_opensource',
      name: 'Open Source Club',
      description: 'Building modern OSS developer tools & frameworks',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      ownerId: 'user_rahul',
      settings: { allowMemberRoomCreation: true, allowMemberInvites: true },
      createdAt: new Date(Date.now() - 15 * 24 * 3600000),
    };

    this.groups.set(groupCollegeCSE._id, groupCollegeCSE);
    this.groups.set(groupOpenSource._id, groupOpenSource);

    // Group Members
    const members = [
      { _id: 'gm_1', groupId: 'group_college_cse', userId: 'user_soham', role: 'owner', joinedAt: new Date(Date.now() - 20 * 24 * 3600000) },
      { _id: 'gm_2', groupId: 'group_college_cse', userId: 'user_rahul', role: 'admin', joinedAt: new Date(Date.now() - 19 * 24 * 3600000) },
      { _id: 'gm_3', groupId: 'group_college_cse', userId: 'user_aman', role: 'member', joinedAt: new Date(Date.now() - 18 * 24 * 3600000) },
      { _id: 'gm_4', groupId: 'group_college_cse', userId: 'user_priya', role: 'member', joinedAt: new Date(Date.now() - 17 * 24 * 3600000) },
      { _id: 'gm_5', groupId: 'group_opensource', userId: 'user_rahul', role: 'owner', joinedAt: new Date(Date.now() - 15 * 24 * 3600000) },
      { _id: 'gm_6', groupId: 'group_opensource', userId: 'user_soham', role: 'admin', joinedAt: new Date(Date.now() - 14 * 24 * 3600000) },
      { _id: 'gm_7', groupId: 'group_opensource', userId: 'user_aman', role: 'member', joinedAt: new Date(Date.now() - 12 * 24 * 3600000) },
    ];
    members.forEach(m => this.groupMembers.set(`${m.groupId}:${m.userId}`, m));

    // 3. Pre-seeded Topic-Based Rooms
    const demoRooms = [
      {
        _id: 'room_general',
        groupId: 'group_college_cse',
        name: 'general',
        description: 'General college discussions, campus updates and announcements',
        visibility: 'public',
        createdBy: 'user_soham',
        createdAt: new Date(Date.now() - 19 * 24 * 3600000),
      },
      {
        _id: 'room_dsa',
        groupId: 'group_college_cse',
        name: 'dsa',
        description: 'Data Structures & Algorithms, LeetCode problem discussions & graph theory',
        visibility: 'public',
        createdBy: 'user_rahul',
        createdAt: new Date(Date.now() - 19 * 24 * 3600000),
      },
      {
        _id: 'room_assignments',
        groupId: 'group_college_cse',
        name: 'assignments',
        description: 'Course assignments, lab submissions and doubt clearing',
        visibility: 'public',
        createdBy: 'user_aman',
        createdAt: new Date(Date.now() - 18 * 24 * 3600000),
      },
      {
        _id: 'room_placements',
        groupId: 'group_college_cse',
        name: 'placements',
        description: 'Placement drives, mock interviews, compensation & referral threads',
        visibility: 'public',
        createdBy: 'user_soham',
        createdAt: new Date(Date.now() - 18 * 24 * 3600000),
      },
      {
        _id: 'room_projects',
        groupId: 'group_college_cse',
        name: 'projects',
        description: 'Capstone project teams, hackathons and code reviews',
        visibility: 'public',
        createdBy: 'user_priya',
        createdAt: new Date(Date.now() - 17 * 24 * 3600000),
      },
      {
        _id: 'room_os_announcements',
        groupId: 'group_opensource',
        name: 'announcements',
        description: 'Release notices and call for contributors',
        visibility: 'public',
        createdBy: 'user_rahul',
        createdAt: new Date(Date.now() - 14 * 24 * 3600000),
      },
      {
        _id: 'room_os_dev',
        groupId: 'group_opensource',
        name: 'dev-chat',
        description: 'Architecture & technical discussion on PRs and RFCs',
        visibility: 'public',
        createdBy: 'user_rahul',
        createdAt: new Date(Date.now() - 14 * 24 * 3600000),
      },
    ];
    demoRooms.forEach(r => this.rooms.set(r._id, r));

    // 4. Pre-seeded Personal Conversations
    const convSohamRahul = {
      _id: 'conv_soham_rahul',
      type: 'private',
      participants: ['user_soham', 'user_rahul'],
      lastMessage: {
        content: 'Awesome, see you in Lab 3 at 4 PM!',
        senderId: 'user_soham',
        createdAt: new Date(Date.now() - 10 * 60000),
      },
      unreadCounts: { user_soham: 0, user_rahul: 1 },
      createdAt: new Date(Date.now() - 10 * 24 * 3600000),
      updatedAt: new Date(Date.now() - 10 * 60000),
    };

    const convSohamAman = {
      _id: 'conv_soham_aman',
      type: 'private',
      participants: ['user_soham', 'user_aman'],
      lastMessage: {
        content: 'Docker containerized build is passing all CI checks now.',
        senderId: 'user_aman',
        createdAt: new Date(Date.now() - 2 * 3600000),
      },
      unreadCounts: { user_soham: 1, user_aman: 0 },
      createdAt: new Date(Date.now() - 8 * 24 * 3600000),
      updatedAt: new Date(Date.now() - 2 * 3600000),
    };

    const convSohamPriya = {
      _id: 'conv_soham_priya',
      type: 'private',
      participants: ['user_soham', 'user_priya'],
      lastMessage: {
        content: 'Shared the new Figma tokens and component specs.',
        senderId: 'user_priya',
        createdAt: new Date(Date.now() - 5 * 3600000),
      },
      unreadCounts: { user_soham: 0, user_priya: 0 },
      createdAt: new Date(Date.now() - 5 * 24 * 3600000),
      updatedAt: new Date(Date.now() - 5 * 3600000),
    };

    this.conversations.set(convSohamRahul._id, convSohamRahul);
    this.conversations.set(convSohamAman._id, convSohamAman);
    this.conversations.set(convSohamPriya._id, convSohamPriya);

    // 5. Pre-seeded Messages (Including Replies/Threads & Reactions from User Prompt)
    const demoMessages = [
      // #dsa room thread
      {
        _id: 'msg_dsa_1',
        roomId: 'room_dsa',
        conversationId: null,
        senderId: 'user_rahul',
        content: 'How does Dijkstra work under the hood? Does anyone have an intuitive mental model?',
        parentMessageId: null,
        attachments: [],
        reactions: [
          { emoji: '💡', userId: 'user_soham', username: 'Soham' },
          { emoji: '👍', userId: 'user_aman', username: 'Aman' },
        ],
        readBy: [{ userId: 'user_rahul' }, { userId: 'user_soham' }, { userId: 'user_aman' }],
        isEdited: false,
        isDeletedForEveryone: false,
        deletedFor: [],
        createdAt: new Date(Date.now() - 90 * 60000),
        updatedAt: new Date(Date.now() - 90 * 60000),
      },
      {
        _id: 'msg_dsa_2',
        roomId: 'room_dsa',
        conversationId: null,
        senderId: 'user_soham',
        content: 'It uses a priority queue (min-heap) to greedily expand the vertex with the minimum known distance, relaxing all its adjacent edges.',
        parentMessageId: 'msg_dsa_1',
        attachments: [],
        reactions: [
          { emoji: '🔥', userId: 'user_rahul', username: 'Rahul' },
          { emoji: '❤️', userId: 'user_priya', username: 'Priya' },
          { emoji: '👍', userId: 'user_aman', username: 'Aman' },
        ],
        readBy: [{ userId: 'user_soham' }, { userId: 'user_rahul' }],
        isEdited: false,
        isDeletedForEveryone: false,
        deletedFor: [],
        createdAt: new Date(Date.now() - 80 * 60000),
        updatedAt: new Date(Date.now() - 80 * 60000),
      },
      {
        _id: 'msg_dsa_3',
        roomId: 'room_dsa',
        conversationId: null,
        senderId: 'user_aman',
        content: 'What about graphs with negative edge weights? Can we still use Dijkstra?',
        parentMessageId: 'msg_dsa_1',
        attachments: [],
        reactions: [{ emoji: '🤔', userId: 'user_rahul', username: 'Rahul' }],
        readBy: [{ userId: 'user_aman' }, { userId: 'user_soham' }],
        isEdited: false,
        isDeletedForEveryone: false,
        deletedFor: [],
        createdAt: new Date(Date.now() - 65 * 60000),
        updatedAt: new Date(Date.now() - 65 * 60000),
      },
      {
        _id: 'msg_dsa_4',
        roomId: 'room_dsa',
        conversationId: null,
        senderId: 'user_soham',
        content: "Dijkstra doesn't support negative weights! The greedy assumption breaks because a previously finalized vertex might later get a cheaper path. Use Bellman-Ford or SPFA instead.",
        parentMessageId: 'msg_dsa_3',
        attachments: [],
        reactions: [
          { emoji: '🚀', userId: 'user_rahul', username: 'Rahul' },
          { emoji: '💯', userId: 'user_aman', username: 'Aman' },
        ],
        readBy: [{ userId: 'user_soham' }, { userId: 'user_aman' }, { userId: 'user_rahul' }],
        isEdited: false,
        isDeletedForEveryone: false,
        deletedFor: [],
        createdAt: new Date(Date.now() - 40 * 60000),
        updatedAt: new Date(Date.now() - 40 * 60000),
      },
      // #general room messages
      {
        _id: 'msg_gen_1',
        roomId: 'room_general',
        conversationId: null,
        senderId: 'user_soham',
        content: 'Welcome everyone to the College CSE official workspace on ChatSpace! 🚀 Feel free to join specific topic rooms for DSA, Assignments, and Placements.',
        parentMessageId: null,
        attachments: [],
        reactions: [
          { emoji: '🎉', userId: 'user_rahul', username: 'Rahul' },
          { emoji: '🙌', userId: 'user_priya', username: 'Priya' },
          { emoji: '🔥', userId: 'user_aman', username: 'Aman' },
        ],
        readBy: [{ userId: 'user_soham' }, { userId: 'user_rahul' }],
        isEdited: false,
        isDeletedForEveryone: false,
        deletedFor: [],
        createdAt: new Date(Date.now() - 2 * 24 * 3600000),
        updatedAt: new Date(Date.now() - 2 * 24 * 3600000),
      },
      {
        _id: 'msg_gen_2',
        roomId: 'room_general',
        conversationId: null,
        senderId: 'user_priya',
        content: 'Hey folks, check out the #projects room if anyone is looking for teammates for the upcoming Hackathon!',
        parentMessageId: null,
        attachments: [],
        reactions: [{ emoji: '✨', userId: 'user_soham', username: 'Soham' }],
        readBy: [{ userId: 'user_priya' }],
        isEdited: false,
        isDeletedForEveryone: false,
        deletedFor: [],
        createdAt: new Date(Date.now() - 24 * 3600000),
        updatedAt: new Date(Date.now() - 24 * 3600000),
      },
      // Personal chat messages: Soham & Rahul
      {
        _id: 'msg_dm_1',
        roomId: null,
        conversationId: 'conv_soham_rahul',
        senderId: 'user_rahul',
        content: 'Hey Soham! Are we still reviewing the distributed systems slides before the viva?',
        parentMessageId: null,
        attachments: [],
        reactions: [],
        readBy: [{ userId: 'user_rahul' }, { userId: 'user_soham' }],
        isEdited: false,
        isDeletedForEveryone: false,
        deletedFor: [],
        createdAt: new Date(Date.now() - 30 * 60000),
        updatedAt: new Date(Date.now() - 30 * 60000),
      },
      {
        _id: 'msg_dm_2',
        roomId: null,
        conversationId: 'conv_soham_rahul',
        senderId: 'user_soham',
        content: 'Yes! I have added consensus algorithms (Raft and Paxos) summary notes into our repo.',
        parentMessageId: 'msg_dm_1',
        attachments: [],
        reactions: [{ emoji: '👍', userId: 'user_rahul', username: 'Rahul' }],
        readBy: [{ userId: 'user_soham' }, { userId: 'user_rahul' }],
        isEdited: false,
        isDeletedForEveryone: false,
        deletedFor: [],
        createdAt: new Date(Date.now() - 25 * 60000),
        updatedAt: new Date(Date.now() - 25 * 60000),
      },
      {
        _id: 'msg_dm_3',
        roomId: null,
        conversationId: 'conv_soham_rahul',
        senderId: 'user_rahul',
        content: 'Awesome, see you in Lab 3 at 4 PM!',
        parentMessageId: null,
        attachments: [],
        reactions: [{ emoji: '🚀', userId: 'user_soham', username: 'Soham' }],
        readBy: [{ userId: 'user_rahul' }],
        isEdited: false,
        isDeletedForEveryone: false,
        deletedFor: [],
        createdAt: new Date(Date.now() - 10 * 60000),
        updatedAt: new Date(Date.now() - 10 * 60000),
      },
    ];

    demoMessages.forEach(m => this.messages.set(m._id, m));

    // 6. Pre-seeded Notifications
    const demoNotifications = [
      {
        _id: 'notif_1',
        recipientId: 'user_soham',
        senderId: 'user_rahul',
        type: 'reply',
        title: 'New Reply in #dsa',
        message: 'Rahul replied to your message in #dsa: "What about graphs with negative edges?"',
        link: '/groups/group_college_cse/rooms/room_dsa',
        isRead: false,
        createdAt: new Date(Date.now() - 40 * 60000),
      },
      {
        _id: 'notif_2',
        recipientId: 'user_soham',
        senderId: 'user_priya',
        type: 'room_activity',
        title: 'New Announcement in #projects',
        message: 'Priya mentioned upcoming Hackathon team slots.',
        link: '/groups/group_college_cse/rooms/room_projects',
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 3600000),
      },
    ];
    demoNotifications.forEach(n => this.notifications.set(n._id, n));

    logger.success('✅ ChatSpace Demo Data Store successfully initialized with rich pre-seeded datasets!');
  }

  // --- Users ---
  getUserById(id) {
    const user = this.users.get(id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return { ...safeUser, isOnline: this.onlineUsers.has(id) };
  }

  getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  getUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  createUser(userData) {
    const _id = userData._id || `user_${uuidv4().slice(0, 8)}`;
    const newUser = {
      _id,
      username: userData.username,
      email: userData.email,
      passwordHash: userData.passwordHash,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userData.username}`,
      bio: userData.bio || 'Available on ChatSpace',
      status: 'online',
      lastSeen: new Date(),
      createdAt: new Date(),
    };
    this.users.set(_id, newUser);
    this.onlineUsers.add(_id);
    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  searchUsers(query, excludeUserId = null) {
    const q = query.toLowerCase().trim();
    const results = [];
    for (const user of this.users.values()) {
      if (excludeUserId && user._id === excludeUserId) continue;
      if (user.username.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)) {
        const { passwordHash, ...safe } = user;
        results.push({ ...safe, isOnline: this.onlineUsers.has(user._id) });
      }
    }
    return results;
  }

  getAllUsers(excludeUserId = null) {
    const results = [];
    for (const user of this.users.values()) {
      if (excludeUserId && user._id === excludeUserId) continue;
      const { passwordHash, ...safe } = user;
      results.push({ ...safe, isOnline: this.onlineUsers.has(user._id) });
    }
    return results;
  }

  setUserStatus(userId, status) {
    const user = this.users.get(userId);
    if (user) {
      user.status = status;
      user.lastSeen = new Date();
      if (status === 'online') {
        this.onlineUsers.add(userId);
      } else if (status === 'offline') {
        this.onlineUsers.delete(userId);
      }
    }
  }

  // --- Conversations ---
  getUserConversations(userId) {
    const list = [];
    for (const conv of this.conversations.values()) {
      if (conv.participants.includes(userId)) {
        // Resolve other participant details
        const otherParticipantId = conv.participants.find(id => id !== userId) || userId;
        const otherUser = this.getUserById(otherParticipantId);
        list.push({
          ...conv,
          participant: otherUser,
          unreadCount: (conv.unreadCounts && conv.unreadCounts[userId]) || 0,
        });
      }
    }
    // Sort by latest updated
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  getOrCreateConversation(userAId, userBId) {
    for (const conv of this.conversations.values()) {
      if (
        conv.type === 'private' &&
        conv.participants.includes(userAId) &&
        conv.participants.includes(userBId)
      ) {
        const otherUser = this.getUserById(userBId);
        return {
          ...conv,
          participant: otherUser,
          unreadCount: (conv.unreadCounts && conv.unreadCounts[userAId]) || 0,
        };
      }
    }

    // Create new
    const _id = `conv_${uuidv4().slice(0, 8)}`;
    const newConv = {
      _id,
      type: 'private',
      participants: [userAId, userBId],
      lastMessage: null,
      unreadCounts: { [userAId]: 0, [userBId]: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(_id, newConv);
    const otherUser = this.getUserById(userBId);
    return { ...newConv, participant: otherUser, unreadCount: 0 };
  }

  getConversationById(convId) {
    return this.conversations.get(convId) || null;
  }

  // --- Groups & Members ---
  getUserGroups(userId) {
    const userGroups = [];
    for (const gm of this.groupMembers.values()) {
      if (gm.userId === userId) {
        const group = this.groups.get(gm.groupId);
        if (group) {
          const rooms = this.getGroupRooms(group._id);
          const membersCount = this.getGroupMembersCount(group._id);
          userGroups.push({
            ...group,
            role: gm.role,
            rooms,
            membersCount,
          });
        }
      }
    }
    return userGroups;
  }

  getGroupById(groupId, userId = null) {
    const group = this.groups.get(groupId);
    if (!group) return null;
    const rooms = this.getGroupRooms(groupId);
    const members = this.getGroupMembers(groupId);
    const userMembership = userId ? this.groupMembers.get(`${groupId}:${userId}`) : null;
    return {
      ...group,
      rooms,
      members,
      currentUserRole: userMembership ? userMembership.role : null,
      isMember: !!userMembership,
    };
  }

  createGroup(name, description, image, ownerId) {
    const _id = `group_${uuidv4().slice(0, 8)}`;
    const group = {
      _id,
      name,
      description: description || '',
      image: image || `https://api.dicebear.com/7.x/identicon/svg?seed=${name}`,
      ownerId,
      settings: { allowMemberRoomCreation: true, allowMemberInvites: true },
      createdAt: new Date(),
    };
    this.groups.set(_id, group);

    // Add owner as member
    const gmId = `gm_${uuidv4().slice(0, 8)}`;
    this.groupMembers.set(`${_id}:${ownerId}`, {
      _id: gmId,
      groupId: _id,
      userId: ownerId,
      role: 'owner',
      joinedAt: new Date(),
    });

    // Create default #general room
    const generalRoomId = `room_${uuidv4().slice(0, 8)}`;
    const generalRoom = {
      _id: generalRoomId,
      groupId: _id,
      name: 'general',
      description: 'General discussions for this group',
      visibility: 'public',
      createdBy: ownerId,
      createdAt: new Date(),
    };
    this.rooms.set(generalRoomId, generalRoom);

    return {
      ...group,
      rooms: [generalRoom],
      role: 'owner',
      membersCount: 1,
    };
  }

  getGroupMembers(groupId) {
    const members = [];
    for (const gm of this.groupMembers.values()) {
      if (gm.groupId === groupId) {
        const user = this.getUserById(gm.userId);
        if (user) {
          members.push({
            ...gm,
            user,
          });
        }
      }
    }
    return members;
  }

  getGroupMembersCount(groupId) {
    let count = 0;
    for (const gm of this.groupMembers.values()) {
      if (gm.groupId === groupId) count++;
    }
    return count;
  }

  isGroupMember(groupId, userId) {
    return this.groupMembers.has(`${groupId}:${userId}`);
  }

  addGroupMember(groupId, userId, role = 'member') {
    const key = `${groupId}:${userId}`;
    if (this.groupMembers.has(key)) return this.groupMembers.get(key);
    const member = {
      _id: `gm_${uuidv4().slice(0, 8)}`,
      groupId,
      userId,
      role,
      joinedAt: new Date(),
    };
    this.groupMembers.set(key, member);
    return member;
  }

  updateMemberRole(groupId, userId, newRole) {
    const key = `${groupId}:${userId}`;
    const member = this.groupMembers.get(key);
    if (member) {
      member.role = newRole;
      return member;
    }
    return null;
  }

  removeGroupMember(groupId, userId) {
    return this.groupMembers.delete(`${groupId}:${userId}`);
  }

  // --- Rooms ---
  getGroupRooms(groupId) {
    const list = [];
    for (const room of this.rooms.values()) {
      if (room.groupId === groupId) {
        list.push(room);
      }
    }
    return list.sort((a, b) => (a.name === 'general' ? -1 : a.name.localeCompare(b.name)));
  }

  getRoomById(roomId) {
    return this.rooms.get(roomId) || null;
  }

  createRoom(groupId, name, description, visibility = 'public', createdBy) {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
    // Check if room name already exists in group
    for (const r of this.rooms.values()) {
      if (r.groupId === groupId && r.name.toLowerCase() === cleanName) {
        throw new Error(`Room #${cleanName} already exists in this group.`);
      }
    }

    const _id = `room_${uuidv4().slice(0, 8)}`;
    const newRoom = {
      _id,
      groupId,
      name: cleanName,
      description: description || '',
      visibility,
      createdBy,
      createdAt: new Date(),
    };
    this.rooms.set(_id, newRoom);
    return newRoom;
  }

  deleteRoom(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    // Cannot delete general
    if (room.name === 'general') {
      throw new Error('Default #general room cannot be deleted.');
    }
    this.rooms.delete(roomId);
    // Delete messages associated with this room
    for (const [id, msg] of this.messages.entries()) {
      if (msg.roomId === roomId) {
        this.messages.delete(id);
      }
    }
    return true;
  }

  // --- Messages & Threads ---
  getMessages({ conversationId, roomId, parentMessageId = null, limit = 50, before = null, userId = null }) {
    let list = [];
    for (const msg of this.messages.values()) {
      if (conversationId && msg.conversationId !== conversationId) continue;
      if (roomId && msg.roomId !== roomId) continue;

      // Thread messages filter
      if (parentMessageId !== undefined && parentMessageId !== null) {
        if (msg.parentMessageId !== parentMessageId) continue;
      }

      // Check delete for me
      if (userId && msg.deletedFor && msg.deletedFor.includes(userId)) {
        continue;
      }

      list.push(this.formatMessage(msg));
    }

    // Sort chronologically ascending
    list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Calculate thread reply counts
    const replyCountMap = new Map();
    for (const msg of this.messages.values()) {
      if (msg.parentMessageId) {
        replyCountMap.set(msg.parentMessageId, (replyCountMap.get(msg.parentMessageId) || 0) + 1);
      }
    }

    return list.map(m => ({
      ...m,
      replyCount: replyCountMap.get(m._id) || 0,
    }));
  }

  getMessageById(messageId) {
    const msg = this.messages.get(messageId);
    if (!msg) return null;
    return this.formatMessage(msg);
  }

  formatMessage(msg) {
    const sender = this.getUserById(msg.senderId);
    let parentMessage = null;
    if (msg.parentMessageId) {
      const parent = this.messages.get(msg.parentMessageId);
      if (parent) {
        const parentSender = this.getUserById(parent.senderId);
        parentMessage = {
          _id: parent._id,
          content: parent.isDeletedForEveryone ? 'This message was deleted' : parent.content,
          sender: parentSender ? { username: parentSender.username, _id: parentSender._id } : null,
        };
      }
    }

    return {
      ...msg,
      sender: sender || { _id: msg.senderId, username: 'Unknown' },
      parentMessage,
      content: msg.isDeletedForEveryone ? 'This message was deleted' : msg.content,
    };
  }

  createMessage({ conversationId, roomId, senderId, content, parentMessageId = null, attachments = [] }) {
    const _id = `msg_${uuidv4().slice(0, 8)}`;
    const msg = {
      _id,
      conversationId: conversationId || null,
      roomId: roomId || null,
      senderId,
      content,
      parentMessageId: parentMessageId || null,
      attachments: attachments || [],
      reactions: [],
      readBy: [{ userId: senderId, readAt: new Date() }],
      isEdited: false,
      editedAt: null,
      isDeletedForEveryone: false,
      deletedFor: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.messages.set(_id, msg);

    // Update conversation last message if it's personal chat
    if (conversationId) {
      const conv = this.conversations.get(conversationId);
      if (conv) {
        conv.lastMessage = {
          content,
          senderId,
          createdAt: msg.createdAt,
        };
        conv.updatedAt = msg.createdAt;
        // Increment unread count for other participants
        conv.participants.forEach(pId => {
          if (pId !== senderId) {
            conv.unreadCounts[pId] = (conv.unreadCounts[pId] || 0) + 1;
          }
        });
      }
    }

    return this.formatMessage(msg);
  }

  editMessage(messageId, userId, newContent) {
    const msg = this.messages.get(messageId);
    if (!msg) throw new Error('Message not found');
    if (msg.senderId !== userId) throw new Error('Unauthorized to edit this message');
    if (msg.isDeletedForEveryone) throw new Error('Cannot edit deleted message');

    msg.content = newContent;
    msg.isEdited = true;
    msg.editedAt = new Date();
    msg.updatedAt = new Date();

    return this.formatMessage(msg);
  }

  deleteMessage(messageId, userId, deleteForEveryone = false) {
    const msg = this.messages.get(messageId);
    if (!msg) throw new Error('Message not found');

    if (deleteForEveryone) {
      if (msg.senderId !== userId) {
        throw new Error('Only the sender can delete this message for everyone');
      }
      msg.isDeletedForEveryone = true;
      msg.content = 'This message was deleted';
      msg.updatedAt = new Date();
      return { messageId, deletedForEveryone: true, message: this.formatMessage(msg) };
    } else {
      if (!msg.deletedFor) msg.deletedFor = [];
      if (!msg.deletedFor.includes(userId)) {
        msg.deletedFor.push(userId);
      }
      return { messageId, deletedForEveryone: false, userId };
    }
  }

  toggleReaction(messageId, userId, emoji) {
    const msg = this.messages.get(messageId);
    if (!msg) throw new Error('Message not found');
    if (msg.isDeletedForEveryone) throw new Error('Cannot react to deleted message');

    const user = this.getUserById(userId);
    const existingIndex = msg.reactions.findIndex(r => r.userId === userId && r.emoji === emoji);

    if (existingIndex > -1) {
      // Remove reaction
      msg.reactions.splice(existingIndex, 1);
    } else {
      // Add reaction
      msg.reactions.push({
        emoji,
        userId,
        username: user ? user.username : 'User',
      });
    }

    return this.formatMessage(msg);
  }

  markConversationRead(conversationId, userId) {
    const conv = this.conversations.get(conversationId);
    if (conv && conv.unreadCounts) {
      conv.unreadCounts[userId] = 0;
    }
    // Mark messages readBy
    for (const msg of this.messages.values()) {
      if (msg.conversationId === conversationId && msg.senderId !== userId) {
        if (!msg.readBy.some(r => r.userId === userId)) {
          msg.readBy.push({ userId, readAt: new Date() });
        }
      }
    }
  }

  // --- Notifications ---
  getUserNotifications(userId) {
    const list = [];
    for (const notif of this.notifications.values()) {
      if (notif.recipientId === userId) {
        list.push(notif);
      }
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createNotification({ recipientId, senderId, type, title, message, link }) {
    const _id = `notif_${uuidv4().slice(0, 8)}`;
    const notif = {
      _id,
      recipientId,
      senderId,
      type,
      title,
      message,
      link: link || '',
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(_id, notif);
    return notif;
  }

  markNotificationAsRead(notifId, userId) {
    const notif = this.notifications.get(notifId);
    if (notif && notif.recipientId === userId) {
      notif.isRead = true;
      return notif;
    }
    return null;
  }

  markAllNotificationsRead(userId) {
    for (const notif of this.notifications.values()) {
      if (notif.recipientId === userId) {
        notif.isRead = true;
      }
    }
    return true;
  }

  // --- Global Search ---
  searchAll(query, userId) {
    const q = query.toLowerCase().trim();
    if (!q) return { users: [], groups: [], rooms: [], messages: [] };

    const matchingUsers = this.searchUsers(q, userId);

    const matchingGroups = [];
    for (const g of this.groups.values()) {
      if (g.name.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q))) {
        matchingGroups.push(g);
      }
    }

    const matchingRooms = [];
    for (const r of this.rooms.values()) {
      if (r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))) {
        const group = this.groups.get(r.groupId);
        matchingRooms.push({ ...r, groupName: group ? group.name : '' });
      }
    }

    const matchingMessages = [];
    for (const m of this.messages.values()) {
      if (m.isDeletedForEveryone) continue;
      if (m.content && m.content.toLowerCase().includes(q)) {
        // Only return if user has access to conversation or group room
        let hasAccess = false;
        let contextName = '';
        if (m.roomId) {
          const room = this.rooms.get(m.roomId);
          if (room) {
            hasAccess = this.isGroupMember(room.groupId, userId);
            contextName = `#${room.name}`;
          }
        } else if (m.conversationId) {
          const conv = this.conversations.get(m.conversationId);
          if (conv && conv.participants.includes(userId)) {
            hasAccess = true;
            contextName = 'Personal Chat';
          }
        }

        if (hasAccess) {
          matchingMessages.push({
            ...this.formatMessage(m),
            contextName,
          });
        }
      }
    }

    return {
      users: matchingUsers.slice(0, 5),
      groups: matchingGroups.slice(0, 5),
      rooms: matchingRooms.slice(0, 5),
      messages: matchingMessages.slice(0, 10),
    };
  }
}

export const store = new DataStore();
