function step(name, status, data) {
  const prefix = `[Pipeline:${name}] ${status}`;
  if (data) {
    console.log(`${prefix}:`, JSON.stringify(data));
  } else {
    console.log(prefix);
  }
}

function complete(context) {
  const duration = Date.now() - context.startTime;
  console.log(`[Pipeline] Complete in ${duration}ms`);
}

function error(name, err) {
  console.error(`[Pipeline:${name}] ERROR:`, err.message);
}

module.exports = { step, complete, error };
