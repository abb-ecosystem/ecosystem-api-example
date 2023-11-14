// https://gist.github.com/softwarespot/151bdf45767392558f00a8c9b9ebcb8f
export function createProcessingQueue(onHandleItem, onHandleTimeout, timeout = 50) {
  const state = {
    queue: [],
    timerId: 0,
  };

  const api = {
    push(...args) {
      state.queue.push(...args);
      api.start();
    },
    start() {
      if (state.timerId > 0) {
        // console.log(`Queue currently processing... `);
        return;
      }

      state.timerId = setTimeout(async () => {
        const endTime = Date.now() + timeout;

        const prevCount = state.queue.length;
        if (state.queue.length > 0) {
          do {
            const val = state.queue.shift();
            await onHandleItem(val);
          } while (state.queue.length > 0 && endTime > Date.now());

          const currCount = state.queue.length;
          const processCount = Math.min(prevCount, prevCount - currCount);
          onHandleTimeout(processCount, currCount);
        }

        api.stop();
        // if (state.queue.length > 0) api.start();
        if (state.queue.length > 0)
          setTimeout(() => {
            api.start();
          }, 50);
      });
    },
    stop() {
      clearTimeout(state.timerId);
      state.timerId = 0;
      // console.log(`Queue just STOPPED... `);
    },
  };

  api.start();

  return api;
}

const handleUpdate = async function (func, args) {
  await func.apply(this, args);
};

function handleTimeout(processCount, currCount) {
  // console.log(`Handle timeout: ${currCount} item(s) remaining and processed ${processCount}`);
}

const state = {
  q: createProcessingQueue(handleUpdate, handleTimeout, 50),
  id: 0,
};

export default state;
