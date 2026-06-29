import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import Link from 'next/link';
import { Card, Input, Typography, Row, Col, Tag, Space, Empty } from 'antd';
import { RiseOutlined, SearchOutlined } from '@ant-design/icons';
import styles from '../styles/Home.module.css';
import { fetchGroups } from '../lib/groupsApi';

const { Title, Paragraph, Text } = Typography;

export default function Home({ groups }) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(groups, {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'items', weight: 0.3 }
      ],
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 1
    });
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return groups;
    }

    return fuse.search(normalizedQuery).map((result) => result.item);
  }, [fuse, groups, query]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Title level={1}>Soft Search</Title>
        <Paragraph>Мягкий поиск по группам и объектам с аналитикой по кварталам и прогнозом продаж.</Paragraph>
        <Input
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Поиск по группе или объекту..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={styles.search}
        />
      </section>

      <Row gutter={[20, 20]}>
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const peakMetric = (group.objects ?? [])
              .flatMap((object) => object.metrics)
              .filter((metric) => metric.fact > 0)
              .sort((a, b) => b.fact - a.fact)[0];
            return (
              <Col xs={24} md={12} lg={8} key={group.name}>
                <Link href={`/groups/${encodeURIComponent(group.name)}`} legacyBehavior>
                  <a className={styles.linkCard}>
                    <Card className={styles.card} hoverable>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div className={styles.cardHeader}>
                          <Title level={4} style={{ margin: 0 }}>{group.name}</Title>
                          <Tag color="purple">Аналитика</Tag>
                        </div>
                        <div>
                          <Text type="secondary">Пик продаж</Text>
                          <div className={styles.metricValue}>{peakMetric?.fact ?? 0}</div>
                        </div>
                        <div className={styles.metaRow}>
                          <span>План: {peakMetric?.plan ?? 0}</span>
                          <span>Факт: {peakMetric?.fact ?? 0}</span>
                        </div>
                        <div className={styles.itemsList}>
                          {group.items.map((item) => (
                            <span key={item}>{item}</span>
                          ))}
                        </div>
                        <div className={styles.footerHint}>
                          <RiseOutlined />
                          Открыть детальную страницу
                        </div>
                      </Space>
                    </Card>
                  </a>
                </Link>
              </Col>
            );
          })
        ) : (
          <Col span={24}>
            <Empty description="Ничего не найдено. Попробуйте другой запрос." />
          </Col>
        )}
      </Row>
    </main>
  );
}

export async function getStaticProps() {
  const groups = await fetchGroups();

  return {
    props: {
      groups
    },
    revalidate: 60 * 60 * 24 * 30 // ререндерить раз в месяц
  };
}
