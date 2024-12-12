const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  /**
   * @param {Error|null} error - The error object, if any occurred during execution.
   * @param {string} stdout - The standard output from the command.
   * @param {string} stderr - The standard error from the command.
   */
  function handleReturn(error, stdout, stderr) {
    if (stdout.search("accepting connections") === -1) {
      showSpinningLoading();
      setTimeout(checkPostgres, 100);
      return;
    }

    logSuccess();
  }
}

let loadingIndex = 0;

function showSpinningLoading() {
  const loadingChars = ["|", "/", "-", "\\"];
  process.stdout.write(`\r${loadingChars[loadingIndex]}`);
  loadingIndex = (loadingIndex + 1) % loadingChars.length;
}

function logSuccess() {
  process.stdout.write("\r");
  console.log("\n🟢 Postgres is ready and accepting connections!\n");
}

console.log("\n🔴 Waiting for Postgres to accept connections.");
checkPostgres();
