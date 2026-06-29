import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import styles from '../styles/Home.module.css';
import { groups as initialGroups } from '../data/groups';

export default function Home({ groups }) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(groups, {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'items', weight: 0.3 }
      ],
      threshold: 0.35,
      includeScore: true,
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
        <h1>Soft Search на Next.js</h1>
        <p>Ищите группы и элементы сразу, без строгих совпадений и с поддержкой опечаток.</p>
        <input
          className={styles.search}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по группам и элементам..."
          aria-label="Поиск по группам и элементам"
        />
      </section>

      <section className={styles.grid}>
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <article key={group.name} className={styles.card}>
              <h2>{group.name}</h2>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))
        ) : (
          <p className={styles.empty}>Ничего не найдено. Попробуйте другой запрос.</p>
        )}
      </section>
    </main>
  );
}

export function getServerSideProps() {
  return {
    props: {
      groups: initialGroups
    }
  };
}
