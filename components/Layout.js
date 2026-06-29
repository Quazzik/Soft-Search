import Link from 'next/link';
import { Layout as AntLayout, Button } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

const { Header, Content } = AntLayout;

export default function Layout({ children }) {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#0f0f14', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" legacyBehavior>
          <a style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Soft Search</a>
        </Link>
        <Button
          icon={<GithubOutlined />}
          href="https://github.com/Quazzik/Soft-Search"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </Button>
      </Header>
      <Content>{children}</Content>
    </AntLayout>
  );
}
