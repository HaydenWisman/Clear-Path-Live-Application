'use client';

import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_by?: string[] | null;
};

type Profile = {
  id: string;
  full_name: string | null;
  role: string | null;
  company: string | null;
  avatar_url: string | null;
};

type InboxConversation = {
  id: string;
  created_at: string;
  otherUser: Profile | null;
  lastMessage: string;
  unreadCount: number;
};

function MessagesPageContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const requestedConversation = searchParams.get('conversation');

  const [userId, setUserId] = useState('');
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);

  const loadInbox = async (currentUserId: string) => {
    const { data: participantRows, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (participantError) {
      setError(participantError.message);
      return;
    }

    const conversationIds = (participantRows || []).map((row: any) => row.conversation_id);

    if (conversationIds.length === 0) {
      setConversations([]);
      return;
    }

    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select('id, created_at')
      .in('id', conversationIds)
      .order('created_at', { ascending: false });

    if (conversationsError) {
      setError(conversationsError.message);
      return;
    }

    const inboxData: InboxConversation[] = [];

    for (const conversation of conversationsData || []) {
      const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversation.id);

      const otherParticipant = (allParticipants || []).find(
        (p: any) => p.user_id !== currentUserId
      );

      let otherUser: Profile | null = null;

      if (otherParticipant) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, role, company, avatar_url')
          .eq('id', otherParticipant.user_id)
          .single();

        otherUser = profileData || null;
      }

      const { data: lastMessages } = await supabase
        .from('messages')
        .select('content, created_at, sender_id, read_by')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const latest = lastMessages?.[0];
      const unreadCount = (lastMessages || []).filter(
        (m: any) => m.sender_id !== currentUserId && !(m.read_by || []).includes(currentUserId)
      ).length;

      inboxData.push({
        id: conversation.id,
        created_at: conversation.created_at,
        otherUser,
        lastMessage: latest?.content || 'No messages yet',
        unreadCount,
      });
    }

    setConversations(inboxData);

    if (requestedConversation && inboxData.some((c) => c.id === requestedConversation)) {
      setSelectedConversation(requestedConversation);
    } else if (inboxData.length > 0 && !selectedConversation) {
      setSelectedConversation(inboxData[0].id);
    }
  };

  useEffect(() => {
    const loadUserAndInbox = async () => {
      setLoading(true);
      setError('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in.');
        setLoading(false);
        return;
      }

      setUserId(user.id);
      await loadInbox(user.id);
      setLoading(false);
    };

    loadUserAndInbox();
  }, [requestedConversation]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) {
        setMessages([]);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('id, content, sender_id, created_at, read_by')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) {
        setError(error.message);
        return;
      }

      const loadedMessages = data || [];
      setMessages(loadedMessages);

      if (userId) {
        const unreadMessages = loadedMessages.filter(
          (m: any) => m.sender_id !== userId && !(m.read_by || []).includes(userId)
        );

        for (const message of unreadMessages) {
          const newReadBy = Array.from(new Set([...(message.read_by || []), userId]));
          await supabase.from('messages').update({ read_by: newReadBy }).eq('id', message.id);
        }

        await loadInbox(userId);
      }
    };

    loadMessages();
  }, [selectedConversation, userId]);

  useEffect(() => {
    const searchProfiles = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      setError('');

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, company, avatar_url')
        .neq('id', userId)
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) {
        setError(error.message);
        setSearching(false);
        return;
      }

      setSearchResults(data || []);
      setSearching(false);
    };

    if (userId) {
      searchProfiles();
    }
  }, [searchTerm, userId]);

  const startConversation = async (targetUserId: string) => {
    setError('');

    const { data: existingParticipantRows, error: existingError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .in('user_id', [userId, targetUserId]);

    if (existingError) {
      setError(existingError.message);
      return;
    }

    const counts: Record<string, number> = {};
    (existingParticipantRows || []).forEach((row: any) => {
      counts[row.conversation_id] = (counts[row.conversation_id] || 0) + 1;
    });

    const existingConversationId = Object.keys(counts).find((id) => counts[id] >= 2);

    if (existingConversationId) {
      setSelectedConversation(existingConversationId);
      setSearchTerm('');
      setSearchResults([]);
      return;
    }

    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (conversationError) {
      setError(conversationError.message);
      return;
    }

    const conversationId = conversationData.id;

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversationId, user_id: userId },
        { conversation_id: conversationId, user_id: targetUserId },
      ]);

    if (participantError) {
      setError(participantError.message);
      return;
    }

    await loadInbox(userId);
    setSelectedConversation(conversationId);
    setSearchTerm('');
    setSearchResults([]);
  };

  const sendMessage = async () => {
    setError('');

    if (!selectedConversation || !newMessage.trim()) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: selectedConversation,
      sender_id: userId,
      content: newMessage,
      read_by: [userId],
    });

    if (error) {
      setError(error.message);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        content: newMessage,
        sender_id: userId,
        created_at: new Date().toISOString(),
        read_by: [userId],
      },
    ]);

    setNewMessage('');
    await loadInbox(userId);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #020406 0%, #05080d 30%, #0a1017 100%)', color: '#f8fafc', fontFamily: 'Arial, sans-serif', paddingTop: '80px', paddingTop: '80px', paddingTop: '80px', paddingTop: '80px', padding: 'clamp(16px, 3vw, 32px)' }}>
      <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '14px' }}>
            Messaging Surface
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', lineHeight: 0.95, letterSpacing: '-0.05em', margin: 0, fontWeight: 800 }}>
            Messages
          </h1>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading messages...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))', padding: '20px' }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                Start Conversation
              </div>

              <input
                type="text"
                placeholder="Search by name, email, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '14px', marginBottom: '12px', background: '#0b1118', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)', boxSizing: 'border-box' }}
              />

              {searching && <p style={{ color: '#94a3b8' }}>Searching...</p>}

              {searchResults.length > 0 && (
                <div style={{ display: 'grid', gap: '10px', marginBottom: '24px' }}>
                  {searchResults.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => startConversation(profile.id)}
                      style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', textAlign: 'left', padding: '12px', background: 'rgba(255,255,255,0.02)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
                    >
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" style={{ width: '42px', height: '42px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.12)' }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {(profile.full_name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <div style={{ fontWeight: 'bold' }}>{profile.full_name || 'Unnamed User'}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {profile.role || 'user'}{profile.company ? ' Â· ' + profile.company : ''}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                Inbox
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                {conversations.map((conversation) => {
                  const other = conversation.otherUser;
                  const initials = other?.full_name
                    ? other.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'U';

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        textAlign: 'left',
                        padding: '12px',
                        background: selectedConversation === conversation.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                        color: '#fff',
                        border: selectedConversation === conversation.id ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer',
                      }}
                    >
                      {other?.avatar_url ? (
                        <img src={other.avatar_url} alt="Profile" style={{ width: '42px', height: '42px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.12)' }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                          {initials}
                        </div>
                      )}

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ fontWeight: 'bold' }}>{other?.full_name || 'Unknown User'}</div>
                          {conversation.unreadCount > 0 && (
                            <div style={{ minWidth: '20px', height: '20px', background: '#ffffff', color: '#020406', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontWeight: 800 }}>
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {other?.role || 'user'}{other?.company ? ' Â· ' + other.company : ''}
                        </div>
                        <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 'min(200px, 42vw)' }}>
                          {conversation.lastMessage}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))', padding: '20px', minHeight: '640px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
                Chat
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gap: '12px', marginBottom: '20px' }}>
                {messages.length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>No messages yet.</p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        alignSelf: message.sender_id === userId ? 'end' : 'start',
                        background: message.sender_id === userId ? '#ffffff' : 'rgba(255,255,255,0.04)',
                        color: message.sender_id === userId ? '#020406' : '#ffffff',
                        padding: '14px 16px',
                        maxWidth: 'min(72%, 520px)',
                        border: message.sender_id === userId ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div>{message.content}</div>
                      <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '6px' }}>
                        {new Date(message.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ flex: 1, padding: '14px', background: '#0b1118', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)', boxSizing: 'border-box' }}
                />

                <button
                  onClick={sendMessage}
                  style={{ padding: '14px 20px', border: 'none', background: '#ffffff', color: '#020406', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}
                >
                  Send
                </button>
              </div>

              {error && <p style={{ color: '#fca5a5', marginTop: '14px' }}>{error}</p>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#020406', color: '#f8fafc', paddingTop: '80px', paddingTop: '80px', paddingTop: '80px', paddingTop: '80px', padding: 'clamp(16px, 3vw, 32px)', fontFamily: 'Arial, sans-serif' }}>Loading messages...</div>}>
      <MessagesPageContent />
    </Suspense>
  );
}



