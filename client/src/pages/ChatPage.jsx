import React, { useState } from 'react';
import { ServerRail } from '../components/sidebar/ServerRail';
import { ChannelSidebar } from '../components/sidebar/ChannelSidebar';
import { DMSidebar } from '../components/sidebar/DMSidebar';
import { UserFooter } from '../components/sidebar/UserFooter';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageList } from '../components/chat/MessageList';
import { MessageComposer } from '../components/chat/MessageComposer';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { ThreadDrawer } from '../components/chat/ThreadDrawer';
import { CreateGroupModal } from '../components/modals/CreateGroupModal';
import { CreateRoomModal } from '../components/modals/CreateRoomModal';
import { GroupSettingsModal } from '../components/modals/GroupSettingsModal';
import { GlobalSearchModal } from '../components/modals/GlobalSearchModal';
import { DemoSwitcherModal } from '../components/modals/DemoSwitcherModal';
import { UserProfileModal } from '../components/modals/UserProfileModal';
import { useChat } from '../context/ChatContext';
import { useNotifications } from '../context/NotificationContext';

export const ChatPage = () => {
  const { currentView, messages, isLoadingMessages, activeRoom, activeConversation } = useChat();
  const { toast } = useNotifications();
  const [replyingTo, setReplyingTo] = useState(null);

  const getTitle = () => {
    if (currentView === 'groups') {
      return activeRoom ? `#${activeRoom.name}` : 'Topic Room';
    }
    return activeConversation?.participant
      ? `@${activeConversation.participant.username}`
      : 'Direct Message';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-chatdark-chat font-sans antialiased text-slate-100 select-none">
      {/* 1. Left Server / Group Rail */}
      <ServerRail />

      {/* 2. Middle Navigation Sub-Sidebar (Channels or DMs) */}
      <div className="flex flex-col h-full flex-shrink-0">
        <div className="flex-1 overflow-hidden">
          {currentView === 'groups' ? <ChannelSidebar /> : <DMSidebar />}
        </div>
        <UserFooter />
      </div>

      {/* 3. Central Chat Main Area */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-chatdark-chat relative overflow-hidden">
        {/* Top Header */}
        <ChatHeader />

        {/* Message Stream */}
        <MessageList
          messages={messages}
          isLoading={isLoadingMessages}
          onReply={(msg) => setReplyingTo(msg)}
          currentTitle={getTitle()}
        />

        {/* Typing status indicator */}
        <TypingIndicator />

        {/* Message Composer */}
        <MessageComposer
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </main>

      {/* 4. Right Collapsible Thread Drawer */}
      <ThreadDrawer />

      {/* Modals & Overlays */}
      <CreateGroupModal />
      <CreateRoomModal />
      <GroupSettingsModal />
      <GlobalSearchModal />
      <DemoSwitcherModal />
      <UserProfileModal />

      {/* In-app Toast Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-chatdark-card/95 border border-brand-500/60 rounded-2xl shadow-2xl backdrop-blur-xl animate-slide-up max-w-sm flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0 animate-ping" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-100">{toast.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
