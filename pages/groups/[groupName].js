import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Card, Typography, Select, Row, Col, Statistic, Space, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { fetchGroups, fetchGroupByName } from '../../lib/groupsApi';

const { Title, Text, Paragraph } = Typography;

function getForecast(series) {
  const validPoints = series.filter((point) => point.fact > 0);
  if (validPoints.length < 2) {
    return null;
  }

  const lastPoint = validPoints[validPoints.length - 1];
  const prevPoint = validPoints[validPoints.length - 2];
  const slope = lastPoint.fact - prevPoint.fact;
  const forecast = lastPoint.fact + slope;

  return Math.round(forecast);
}

export default function GroupDetailPage({ group }) {
  const router = useRouter();
  const [selectedObject, setSelectedObject] = useState(group?.objects?.[0]?.name ?? '');

  const selectedMetric = useMemo(() => {
    if (!group || !selectedObject) {
      return null;
    }

    return group.objects.find((item) => item.name === selectedObject) ?? group.objects[0];
  }, [group, selectedObject]);

  if (!group) {
    return <div style={{ padding: 24 }}>Группа не найдена</div>;
  }

  const chartData = selectedMetric?.metrics.map((metric) => {
    const hasRealFact = metric.fact > 0;

    return {
      ...metric,
      hasFact: hasRealFact,
      showPoint: hasRealFact,
      factValue: hasRealFact ? metric.fact : null,
      planValue: metric.plan
    };
  }) ?? [];

  const latest = selectedMetric?.metrics.filter((metric) => metric.fact > 0).slice(-1)[0];
  const currentQuarter = selectedMetric?.metrics.find((metric) => metric.period === '2026 Q2');
  const planPercent = currentQuarter ? Math.round((currentQuarter.fact / currentQuarter.plan) * 100) : 0;

  let percentColor = '#dc2626';
  if (planPercent >= 100) {
    percentColor = '#16a34a';
  } else if (planPercent >= 75) {
    percentColor = '#f59e0b';
  }

  const peakMetric = [...(selectedMetric?.metrics ?? [])].filter((metric) => metric.fact > 0).sort((a, b) => b.fact - a.fact)[0];

  const selectorOptions = group.objects.map((obj) => {
    const current = obj.metrics.find((metric) => metric.period === '2026 Q2');
    const progress = current ? Math.round((current.fact / current.plan) * 100) : 0;
    return {
      value: obj.name,
      label: `${obj.name} • ${current?.plan ?? 0}/${current?.fact ?? 0} • ${progress}%`
    };
  });

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Link href="/" legacyBehavior>
        <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, color: '#6d28d9' }}>
          <ArrowLeftOutlined />
          Вернуться к списку
        </a>
      </Link>

      <Title level={2}>{group.name}</Title>
      <Paragraph type="secondary">Аналитика по выбранному объекту группы с прогнозом продаж на следующий квартал.</Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card style={{ height: '100%' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text type="secondary">Текущий квартал</Text>
              <Title level={3} style={{ margin: 0 }}>{currentQuarter?.period ?? '—'}</Title>
              <Statistic title="Процент достижения плана" value={planPercent} suffix="%" valueStyle={{ color: percentColor, fontWeight: 700 }} />
              <Text>План: {currentQuarter?.plan ?? 0}</Text>
              <Text>Факт: {currentQuarter?.fact ?? 0}</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card style={{ height: '60%' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text type="secondary">Лучший период</Text>
              <Title level={3} style={{ margin: 0 }}>{peakMetric?.period ?? '—'}</Title>
              <Text>План: {peakMetric?.plan ?? 0}</Text>
              <Text>Факт: {peakMetric?.fact ?? 0}</Text>
            </Space>
          </Card>
            <Card style={{ height: '35%', marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <Text type="secondary">Выбор продукта</Text>
                    <div style={{ marginTop: 4 }}>
                    <Select value={selectedObject} style={{ width: 280 }} onChange={setSelectedObject} options={selectorOptions} />
                    </div>
                </div>
                </div>
            </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <Title level={4} style={{ margin: 0 }}>Продажи по кварталам</Title>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#f0f0f0" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, name === 'fact' ? 'Фактическое' : 'Плановое']}
                labelFormatter={(label) => `Период: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="factValue"
                stroke="#6d28d9"
                strokeWidth={3}
                connectNulls={false}
                dot={(props) => {
                  if (!props || props.payload?.fact == null || props.payload.fact <= 0) {
                    return null;
                  }
                  return <circle cx={props.cx} cy={props.cy} r={4} fill="#6d28d9" stroke="#fff" strokeWidth={2} />;
                }}
              />
              <Line
                type="monotone"
                dataKey="planValue"
                stroke="#a78bfa"
                strokeWidth={2}
                connectNulls={false}
                dot={(props) => {
                  if (!props || props.payload?.plan == null || props.payload.plan <= 0) {
                    return null;
                  }
                  if (props.payload?.fact > 0) {
                    return null;
                  }
                  return <circle cx={props.cx} cy={props.cy} r={4} fill="#a78bfa" stroke="#fff" strokeWidth={2} />;
                }}
              />
              <ReferenceLine x="2026 Q2" stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        </Space>
      </Card>

      <Card>
        <Title level={4}>Ключевые показатели</Title>
        <Divider />
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Statistic title="Последний факт" value={latest?.fact ?? 0} />
          </Col>
          <Col xs={24} md={8}>
            <Statistic title="Прогноз на Q3" value={getForecast(selectedMetric?.metrics ?? [])} />
          </Col>
          <Col xs={24} md={8}>
            <Statistic title="Текущий план" value={currentQuarter?.plan ?? 0} />
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export async function getStaticPaths() {
  const groups = await fetchGroups();

  return {
    paths: groups.map((group) => ({
      params: {
        groupName: group.name
      }
    })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const group = await fetchGroupByName(params.groupName);

  return {
    props: {
      group: group ?? null
    },
    revalidate: 60 * 60 * 24 * 30 // ререндерить раз в месяц
  };
}
