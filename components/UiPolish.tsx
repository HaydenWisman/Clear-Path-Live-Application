'use client';

import React from 'react';

export function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'inline-block',
        marginBottom: '18px',
        color: '#94a3b8',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
      }}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
        padding: '28px',
      }}
    >
      <div
        style={{
          color: '#ffffff',
          fontSize: '20px',
          fontWeight: 800,
          marginBottom: '8px',
        }}
      >
        {title}
      </div>
      <div
        style={{
          color: '#94a3b8',
          lineHeight: 1.7,
          maxWidth: '780px',
        }}
      >
        {body}
      </div>
    </div>
  );
}

export function Divider() {
  return (
    <div
      style={{
        height: '1px',
        width: '100%',
        background: 'rgba(255,255,255,0.08)',
      }}
    />
  );
}
