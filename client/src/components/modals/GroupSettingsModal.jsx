import React, { useState, useEffect } from 'react';
import { X, Users, Shield, UserPlus, Trash2, LogOut, Check, ChevronDown } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import api from '../../services/api';

export const GroupSettingsModal = () => {
  const { isGroupSettingsOpen, setIsGroupSettingsOpen, activeGroupId, activeGroup, refreshWorkspace } = useChat();
  const { user: currentUser } = useAuth();

  const [members, setMembers] = useState([]);
  const [inviteUserId, setInviteUserId] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (activeGroupId && isGroupSettingsOpen) {
      loadGroupData();
    }
  }, [activeGroupId, isGroupSettingsOpen]);

  const loadGroupData = async () => {
    try {
      const [groupRes, usersRes] = await Promise.all([
        api.get(`/groups/${activeGroupId}`),
        api.get('/users'),
      ]);
      if (groupRes.success) {
        setMembers(groupRes.group.members || []);
      }
      if (usersRes.success) {
        setAllUsers(usersRes.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isGroupSettingsOpen || !activeGroup) return null;

  const isOwner = activeGroup.ownerId === currentUser?._id;
  const isAdmin = isOwner || members.some(m => m.userId === currentUser?._id && m.role === 'admin');

  const handleInvite = async (userId) => {
    if (!userId) return;
    setIsLoading(true);
    setMessage('');
    try {
      const res = await api.post(`/groups/${activeGroupId}/members`, { userId, role: 'member' });
      if (res.success) {
        setMessage('Member added successfully!');
        loadGroupData();
        refreshWorkspace();
      }
    } catch (err) {
      setMessage(err.message || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    try {
      await api.put(`/groups/${activeGroupId}/members/role`, { targetUserId, newRole });
      loadGroupData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/groups/${activeGroupId}/members/${userId}`);
      loadGroupData();
      refreshWorkspace();
    } catch (e) {
      console.error(e);
    }
  };

  // Filter out existing members for invite dropdown
  const memberUserIds = new Set(members.map(m => m.userId));
  const nonMembers = allUsers.filter(u => !memberUserIds.has(u._id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-chatdark-card border border-chatdark-border rounded-3xl p-6 shadow-2xl animate-slide-up relative">
        <button
          onClick={() => setIsGroupSettingsOpen(false)}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-chatdark-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border border-chatdark-border shadow-sm flex-shrink-0">
            {activeGroup.image ? (
              <img src={activeGroup.image} alt={activeGroup.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-600 flex items-center justify-center font-bold text-white">
                {activeGroup.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">{activeGroup.name}</h3>
            <p className="text-xs text-slate-400">{activeGroup.description || 'Group Workspace'}</p>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-brand-950/60 border border-brand-500/30 rounded-xl text-xs text-brand-300">
            {message}
          </div>
        )}

        {/* Invite Member Section */}
        {isAdmin && nonMembers.length > 0 && (
          <div className="mb-5 p-3.5 bg-chatdark-sidebar border border-chatdark-border/70 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-brand-400" />
              <span>Add Member to Group</span>
            </h4>
            <div className="flex gap-2">
              <select
                value={inviteUserId}
                onChange={(e) => setInviteUserId(e.target.value)}
                className="flex-1 bg-chatdark-card border border-chatdark-border rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="">Select a user...</option>
                {nonMembers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.username} ({u.email})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleInvite(inviteUserId)}
                disabled={!inviteUserId || isLoading}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-glow-brand transition-all"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Members ({members.length})
            </h4>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {members.map((m) => {
              const u = m.user;
              if (!u) return null;
              const isMemberSelf = u._id === currentUser?._id;

              return (
                <div
                  key={m._id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-chatdark-sidebar border border-chatdark-border/40"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={u.avatar} name={u.username} size="sm" status={u.status || 'offline'} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-200">{u.username}</span>
                        {isMemberSelf && (
                          <span className="text-[10px] text-slate-400 italic">(you)</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 capitalize">{m.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role Tag / Selector */}
                    {isOwner && !isMemberSelf ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-chatdark-card border border-chatdark-border text-[11px] text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          m.role === 'owner'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : m.role === 'admin'
                            ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                            : 'bg-slate-700/40 text-slate-400'
                        }`}
                      >
                        {m.role.toUpperCase()}
                      </span>
                    )}

                    {/* Remove Member */}
                    {(isAdmin || isMemberSelf) && m.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(u._id)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-chatdark-card transition-colors"
                        title={isMemberSelf ? 'Leave Group' : 'Remove Member'}
                      >
                        {isMemberSelf ? <LogOut className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
