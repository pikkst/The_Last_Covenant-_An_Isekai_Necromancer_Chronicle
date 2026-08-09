async function main() {
  console.log('Worker starting...');
}

main().catch((err) => {
  console.error('Worker failed', err);
  process.exit(1);
});
