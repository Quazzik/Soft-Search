const { fetchGroups } = require('../lib/groupsApi');

async function main() {
  const groups = await fetchGroups();
  console.log(JSON.stringify(groups, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
