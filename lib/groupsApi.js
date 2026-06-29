import { groups as initialGroups } from '../data/groups';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchGroups() {
  // Симуляция запроса к API, который возвращает JSON.
  await delay(20);
  return initialGroups;
}

export async function fetchGroupByName(groupName) {
  const groups = await fetchGroups();
  return groups.find((group) => group.name === groupName) ?? null;
}
