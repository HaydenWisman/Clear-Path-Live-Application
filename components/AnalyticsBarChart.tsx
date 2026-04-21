'use client';

type ChartItem = {
  label: string;
  count: number;
};

type Props = {
  title: string;
  items: ChartItem[];
  emptyText?: string;
};

export default function AnalyticsBarChart({
  title,
  items,
  emptyText = 'No data yet.',
}: Props) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
        padding: '22px',
      }}
    >
      <div
        style={{
          color: '#94a3b8',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '16px',
        }}
      >
        {title}
      </div>

      {items.length === 0 ? (
        <div style={{ color: '#94a3b8', padding: '12px 0' }}>{emptyText}</div>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {items.map((item) => {
            const width = `${Math.max(8, (item.count / max) * 100)}%`;

            return (
              <div key={item.label}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '6px',
                    fontSize: '13px',
                    color: '#e2e8f0',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                  <strong style={{ color: '#ffffff' }}>{item.count}</strong>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    background: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width,
                      height: '100%',
                      background: '#ffffff',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
