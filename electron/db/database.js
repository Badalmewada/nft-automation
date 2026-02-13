const logger = require('../utils/logger');
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      wallets: [],
      walletGroups: []
    }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

let state = load();

module.exports = {
  wallets: {
    async findAll() {
      return state.wallets;
    },

    async findById(id) {
      return state.wallets.find(w => w.id === id);
    },

    async create(wallet) {
      state.wallets.push(wallet);
      save(state);
      return wallet;
    },

    async createMany(arr) {
      state.wallets.push(...arr);
      save(state);
      return arr;
    },

    async delete(id) {
      state.wallets = state.wallets.filter(w => w.id !== id);
      save(state);
    },

    async deleteMany(ids) {
      state.wallets = state.wallets.filter(w => !ids.includes(w.id));
      save(state);
      return ids.length;
    },

    async update(id, updates) {
      const w = state.wallets.find(x => x.id === id);
      if (!w) return null;
      Object.assign(w, updates);
      save(state);
      return w;
    }
  },

  walletGroups: {
    async findAll() {
      return state.walletGroups;
    },

    async create(group) {
      state.walletGroups.push(group);
      save(state);
      return group;
    },

    async delete(id) {
      state.walletGroups = state.walletGroups.filter(g => g.id !== id);
      save(state);
    },

    async update(id, updates) {
      const g = state.walletGroups.find(x => x.id === id);
      if (!g) return null;
      Object.assign(g, updates);
      save(state);
      return g;
    }
  }
};
