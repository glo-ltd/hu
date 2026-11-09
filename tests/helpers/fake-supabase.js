// In-memory stand-in for the parts of supabase-js the functions use:
// from().select/insert/update/delete with eq/neq/in/ilike/gte/order/limit,
// single/maybeSingle; storage (signed upload/view URLs, list, remove);
// auth.getUser. Enforces the same constraints as the real tables where
// they matter to the tests (photo count, display name length, cascade).
const crypto = require('crypto');

const STATUSES = ['new', 'contacted', 'profile_in_progress', 'profile_complete', 'withdrawn', 'deleted'];

function clone(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }

class Query {
  constructor(db, table) {
    this.db = db; this.table = table; this.op = 'select'; this.filters = [];
    this.cols = '*'; this.returning = false; this.mode = null; this.orderBy = null; this.max = null; this.countOpt = null;
  }
  select(cols, opts) {
    if (this.op === 'select') { this.cols = cols || '*'; this.countOpt = opts || null; }
    else { this.returning = true; this.cols = cols || '*'; }
    return this;
  }
  insert(rows) { this.op = 'insert'; this.payload = Array.isArray(rows) ? rows : [rows]; return this; }
  update(obj) { this.op = 'update'; this.payload = obj; return this; }
  delete() { this.op = 'delete'; return this; }
  eq(c, v) { this.filters.push((r) => r[c] === v); return this; }
  neq(c, v) { this.filters.push((r) => r[c] !== v); return this; }
  in(c, arr) { this.filters.push((r) => arr.indexOf(r[c]) !== -1); return this; }
  gte(c, v) { this.filters.push((r) => r[c] >= v); return this; }
  ilike(c, pattern) {
    const re = new RegExp('^' + pattern.replace(/\\([\\%_])/g, '\u0000$1').replace(/[.*+?^${}()|[\]]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.').replace(/\u0000(.)/g, (m, ch) => '\\' + ch) + '$', 'i');
    this.filters.push((r) => r[c] != null && re.test(r[c]));
    return this;
  }
  order(c, o) { this.orderBy = { c, asc: !o || o.ascending !== false }; return this; }
  limit(n) { this.max = n; return this; }
  single() { this.mode = 'single'; return this; }
  maybeSingle() { this.mode = 'maybe'; return this; }
  then(res, rej) { return Promise.resolve().then(() => this.run()).then(res, rej); }

  project(row) {
    if (this.cols === '*' ) return clone(row);
    const out = {};
    this.cols.split(',').map((s) => s.trim()).filter(Boolean).forEach((c) => { out[c] = clone(row[c]); });
    return out;
  }
  check(row) {
    if (this.table === 'candidates' && STATUSES.indexOf(row.status) === -1) return 'invalid enum value ' + row.status;
    if (this.table === 'candidate_profiles') {
      if ((row.photo_paths || []).length > 3) return 'violates check constraint "candidate_profiles_max_photos"';
      if (row.display_name && row.display_name.length > 40) return 'violates check constraint "candidate_profiles_display_name_length"';
      if (!row.questions_version) return 'null value in column "questions_version"';
      if (!this.db.tables.candidates.some((c) => c.id === row.candidate_id)) return 'violates foreign key constraint';
    }
    return null;
  }
  run() {
    const db = this.db;
    if (db.failNext && db.failNext[this.table + ':' + this.op]) {
      delete db.failNext[this.table + ':' + this.op];
      return { data: null, error: { message: 'simulated failure' } };
    }
    db.calls.push({ table: this.table, op: this.op, payload: clone(this.payload) });
    const rows = db.tables[this.table];
    if (!rows) return { data: null, error: { message: 'relation "' + this.table + '" does not exist' } };
    const match = (r) => this.filters.every((f) => f(r));
    let result;
    const now = new Date().toISOString();
    if (this.op === 'insert') {
      result = [];
      for (const p of this.payload) {
        const row = Object.assign(this.table === 'candidates' ? { id: crypto.randomUUID(), status: 'new' } : {}, this.defaults(), clone(p));
        const err = this.check(row);
        if (err) return { data: null, error: { message: err } };
        if (this.table === 'candidate_profiles' && rows.some((r) => r.candidate_id === row.candidate_id)) return { data: null, error: { message: 'duplicate key' } };
        rows.push(row); result.push(row);
      }
    } else if (this.op === 'update') {
      result = [];
      for (const r of rows.filter(match)) {
        const next = Object.assign({}, r, clone(this.payload), { updated_at: now });
        const err = this.check(next);
        if (err) return { data: null, error: { message: err } };
        Object.assign(r, next); result.push(r);
      }
    } else if (this.op === 'delete') {
      result = rows.filter(match);
      db.tables[this.table] = rows.filter((r) => !match(r));
      if (this.table === 'candidates') {
        const ids = result.map((r) => r.id);
        db.tables.candidate_profiles = db.tables.candidate_profiles.filter((p) => ids.indexOf(p.candidate_id) === -1);
      }
    } else {
      result = rows.filter(match);
      if (this.orderBy) {
        const { c, asc } = this.orderBy;
        result = result.slice().sort((a, b) => (a[c] < b[c] ? -1 : a[c] > b[c] ? 1 : 0) * (asc ? 1 : -1));
      }
      if (this.max != null) result = result.slice(0, this.max);
      if (this.countOpt && this.countOpt.head) return { data: null, count: result.length, error: null };
    }
    if (this.op !== 'select' && !this.returning && !this.mode) return { data: null, error: null };
    let data = result.map((r) => this.project(r));
    if (this.mode === 'single') {
      if (data.length !== 1) return { data: null, error: { message: 'JSON object requested, multiple (or no) rows returned' } };
      data = data[0];
    } else if (this.mode === 'maybe') {
      if (data.length > 1) return { data: null, error: { message: 'multiple rows' } };
      data = data[0] || null;
    }
    return { data, error: null };
  }
  defaults() {
    const now = new Date().toISOString();
    if (this.table === 'candidate_profiles') {
      return { answers: {}, photo_paths: [], translations: {}, display_name: null, consent_photo_sharing_at: null, consent_profile_text_version: null,
        confirmed_true_at: null, submitted_at: null, translated_by: null, translated_at: null, created_at: now, updated_at: now };
    }
    return { created_at: now, updated_at: now };
  }
}

class FakeSupabase {
  constructor(opts) {
    this.baseUrl = (opts && opts.baseUrl) || 'http://fake-storage.test';
    this.reset();
    const self = this;
    this.auth = {
      async getUser(token) {
        const u = self.users[token];
        if (!u) return { data: { user: null }, error: { message: 'invalid JWT' } };
        if (u.expiresAt && u.expiresAt < Date.now()) return { data: { user: null }, error: { message: 'JWT expired' } };
        return { data: { user: { id: u.id || 'u1', email: u.email } }, error: null };
      },
    };
    this.storage = { from: (bucket) => self.bucket(bucket) };
  }
  reset() {
    this.tables = { candidates: [], candidate_profiles: [], candidate_waitlist: [] };
    this.objects = {}; // "bucket/path" -> { bytes: Buffer, contentType }
    this.uploadTokens = {};
    this.users = {};
    this.calls = [];
    this.failNext = {};
  }
  from(table) { return new Query(this, table); }
  async rpc() { return { data: null, error: { message: 'no rpc' } }; }
  bucket(bucket) {
    const self = this;
    const key = (p) => bucket + '/' + p;
    return {
      async createSignedUploadUrl(path) {
        const token = crypto.randomBytes(12).toString('hex');
        self.uploadTokens[token] = key(path);
        return { data: { signedUrl: self.baseUrl + '/storage/v1/object/upload/sign/' + bucket + '/' + path + '?token=' + token, token, path }, error: null };
      },
      async createSignedUrl(path) {
        if (!self.objects[key(path)]) return { data: null, error: { message: 'Object not found' } };
        return { data: { signedUrl: self.baseUrl + '/storage/v1/object/sign/' + bucket + '/' + path + '?token=view' }, error: null };
      },
      async createSignedUrls(paths) {
        return { data: paths.map((p) => self.objects[key(p)]
          ? { path: p, signedUrl: self.baseUrl + '/storage/v1/object/sign/' + bucket + '/' + p + '?token=view', error: null }
          : { path: p, signedUrl: null, error: 'Object not found' }), error: null };
      },
      async list(prefix) {
        const pre = key(prefix) + '/';
        return { data: Object.keys(self.objects).filter((k) => k.indexOf(pre) === 0).map((k) => ({ name: k.slice(pre.length) })), error: null };
      },
      async remove(paths) {
        paths.forEach((p) => { delete self.objects[key(p)]; });
        return { data: paths.map((p) => ({ name: p })), error: null };
      },
    };
  }
  // Used by the e2e server for the browser's direct PUT to a signed URL.
  putSigned(token, bytes, contentType) {
    const k = this.uploadTokens[token];
    if (!k) return false;
    delete this.uploadTokens[token];
    this.objects[k] = { bytes, contentType };
    return true;
  }
  addObject(path, bytes) { this.objects['candidate-photos/' + path] = { bytes: bytes || Buffer.from('x'), contentType: 'image/jpeg' }; }
  hasObject(path) { return !!this.objects['candidate-photos/' + path]; }
}

module.exports = { FakeSupabase };
