const prefix = 'kodiraj.learning.v1.';

export function createProgress(course, storage = globalThis) {
  const key = prefix + course;
  let memory = { completed: [], last: null };
  return {
    key,
    read() {
      try {
        const saved = JSON.parse(storage.localStorage.getItem(key));
        if (Array.isArray(saved?.completed)) {
          memory = { completed: saved.completed.filter(id => typeof id === 'string'), last: typeof saved.last === 'string' ? saved.last : null };
        } else {
          memory = { completed: [], last: null };
        }
      } catch { /* Keep progress usable when storage is unavailable. */ }
      return memory;
    },
    save(state) {
      memory = state;
      try { storage.localStorage.setItem(key, JSON.stringify(state)); }
      catch { /* The current page still has its in-memory state. */ }
    }
  };
}

export function courseSnapshot(state, ids) {
  const completed = new Set(ids.filter(id => state.completed.includes(id)));
  return {
    completed,
    percent: ids.length ? Math.round(100 * completed.size / ids.length) : 0,
    resume: ids.includes(state.last) ? state.last : ids.find(id => !completed.has(id)) ?? ids[0]
  };
}
